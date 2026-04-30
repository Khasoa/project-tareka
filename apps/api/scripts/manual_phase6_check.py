from __future__ import annotations

import asyncio
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import func, select

from app.db.session import SessionLocal
from app.models.audit_log import AuditLog
from app.models.company import Company
from app.models.sat_payout import SatPayout
from app.models.user import User
from app.models.wallet import Wallet
from app.services import bitcoin_service as bs
from app.services import translation_service as ts
from app.services.ussd_service import handle_session


def _phone() -> str:
    return f"+254700{uuid4().int % 10_000_000:07d}"


def _pick_company_id(db):
    company = db.scalars(select(Company).limit(1)).first()
    if not company:
        raise RuntimeError("No company found")
    return company.id


def _create_user(db, phone: str, language: str = "en", name: str = "User") -> User:
    u = User(
        id=str(uuid4()),
        full_name=name,
        phone=phone,
        role="recycler",
        language=language,
        is_active=True,
        is_verified=False,
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


def _create_wallet(db, user_id: str, company_id: str, balance: Decimal):
    w = Wallet(
        id=str(uuid4()),
        user_id=user_id,
        company_id=company_id,
        token_balance=balance,
        lifetime_earned=balance,
        lifetime_redeemed=Decimal("0"),
    )
    db.add(w)
    db.commit()


def _create_sat(db, user_id: str, company_id: str, status: str, attempt_count: int) -> SatPayout:
    p = SatPayout(
        id=str(uuid4()),
        user_id=user_id,
        company_id=company_id,
        dropoff_id=None,
        sats_amount=100,
        status=status,
        attempt_count=attempt_count,
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


def run_checks() -> None:
    db = SessionLocal()
    created_user_ids: list[str] = []
    created_sat_ids: list[str] = []
    try:
        company_id = _pick_company_id(db)
        base_audit = db.scalar(select(func.count()).select_from(AuditLog).where(AuditLog.action == "bitcoin_payout_attempt")) or 0

        phone1, phone2, phone3, phone4, phone5 = _phone(), _phone(), _phone(), _phone(), _phone()

        menu = handle_session("s1", phone1, "", db)
        reg = handle_session("s2", phone2, "1*Mary*1", db)
        reg_user = db.scalars(select(User).where(User.phone == phone2)).first()
        if reg_user:
            created_user_ids.append(reg_user.id)

        bal_user = _create_user(db, phone3, "en", "Bal User")
        created_user_ids.append(bal_user.id)
        _create_wallet(db, bal_user.id, company_id, Decimal("50"))
        balance = handle_session("s3", phone3, "2", db)

        sw_user = _create_user(db, phone4, "sw", "Sw User")
        created_user_ids.append(sw_user.id)
        sw_menu = handle_session("s4", phone4, "", db)

        sat_user = _create_user(db, phone5, "en", "Sat User")
        created_user_ids.append(sat_user.id)
        pending = _create_sat(db, sat_user.id, company_id, "pending", 0)
        created_sat_ids.append(pending.id)

        class OkResp:
            status_code = 200
            content = b"{}"
            def json(self):
                return {"id": "kotani-ref-1"}

        class OkClient:
            def __init__(self, timeout=20.0):
                pass
            def __enter__(self):
                return self
            def __exit__(self, exc_type, exc, tb):
                return False
            def post(self, *args, **kwargs):
                return OkResp()

        class FailClient:
            def __init__(self, timeout=20.0):
                pass
            def __enter__(self):
                return self
            def __exit__(self, exc_type, exc, tb):
                return False
            def post(self, *args, **kwargs):
                raise RuntimeError("provider down")

        old_client = bs.httpx.Client
        old_key = bs.settings.KOTANI_API_KEY

        bs.httpx.Client = OkClient
        bs.settings.KOTANI_API_KEY = "test"
        ok_sent = bs.trigger_sat_payout(db, pending)
        db.refresh(pending)

        failed = _create_sat(db, sat_user.id, company_id, "failed", 2)
        created_sat_ids.append(failed.id)
        bs.httpx.Client = FailClient
        fail_sent = bs.trigger_sat_payout(db, failed)
        db.refresh(failed)

        missing = _create_sat(db, sat_user.id, company_id, "pending", 0)
        created_sat_ids.append(missing.id)
        bs.settings.KOTANI_API_KEY = ""
        missing_sent = bs.trigger_sat_payout(db, missing)
        db.refresh(missing)

        bs.httpx.Client = old_client
        bs.settings.KOTANI_API_KEY = old_key

        after_audit = db.scalar(select(func.count()).select_from(AuditLog).where(AuditLog.action == "bitcoin_payout_attempt")) or 0

        dropoff_has_no_external = "trigger_sat_payout" not in open("app/services/dropoff_service.py", "r", encoding="utf-8").read()

        mem = {}
        calls = {"nllb": 0}
        old_get, old_set = ts.cache_get_json, ts.cache_set_json
        old_nllb, old_log = ts._translate_with_nllb, ts._safe_log

        def _get(k):
            return mem.get(k)

        def _set(k, v, ttl_seconds):
            mem[k] = v

        async def _fake_nllb(text, source_language, target_language):
            calls["nllb"] += 1
            return f"sw::{text}"

        ts.cache_get_json = _get
        ts.cache_set_json = _set
        ts._translate_with_nllb = _fake_nllb
        ts._safe_log = lambda *args, **kwargs: None

        asyncio.run(ts.translate_content(db, text="Hello cache", target_language="sw", actor_user_id=None))
        asyncio.run(ts.translate_content(db, text="Hello cache", target_language="sw", actor_user_id=None))

        ts.cache_get_json, ts.cache_set_json = old_get, old_set
        ts._translate_with_nllb, ts._safe_log = old_nllb, old_log

        print(
            {
                "1_menu": menu,
                "2_register": reg,
                "3_balance": balance,
                "4_sw_menu": sw_menu,
                "5_pending_processed": {"sent": ok_sent, "status": pending.status},
                "6_failed_safe": {"sent": fail_sent, "status": failed.status, "reason": failed.failure_reason},
                "7_missing_key_safe": {"sent": missing_sent, "status": missing.status, "reason": missing.failure_reason},
                "8_audit_logs_created": after_audit > base_audit,
                "9_no_external_in_dropoff": dropoff_has_no_external,
                "10_translation_cache_nllb_calls": calls["nllb"],
            }
        )
    finally:
        db.rollback()
        for sid in created_sat_ids:
            s = db.scalars(select(SatPayout).where(SatPayout.id == sid)).first()
            if s:
                db.delete(s)
        for uid in created_user_ids:
            db.execute(Wallet.__table__.delete().where(Wallet.user_id == uid))
            u = db.scalars(select(User).where(User.id == uid)).first()
            if u:
                db.delete(u)
        db.commit()
        db.close()


if __name__ == "__main__":
    run_checks()
