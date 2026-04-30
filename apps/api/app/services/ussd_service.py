from __future__ import annotations

import asyncio
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.dropoff import Dropoff
from app.models.user import User
from app.models.wallet import Wallet
from app.services.translation_service import translate_for_channel

_MENU_EN = """CON Welcome to tareka
1. Register
2. Check balance
3. Find nearest site
4. My reward status
0. Exit"""

_MENU_SW = """CON Karibu tareka
1. Jisajili
2. Angalia salio
3. Tafuta kituo
4. Hali ya zawadi
0. Toka"""


def handle_session(session_id: str, phone: str, text: str, db: Session) -> str:
    text = (text or "").strip()
    parts = [p for p in text.split("*") if p != ""]

    user = db.scalars(select(User).where(User.phone == phone)).first()
    lang = user.language if user and user.language in {"en", "sw"} else "en"

    if not text:
        _audit_ussd(db, user, phone, session_id, action="menu")
        return _MENU_SW if lang == "sw" else _MENU_EN

    choice = parts[0] if parts else ""

    if choice == "0":
        _audit_ussd(db, user, phone, session_id, action="exit")
        return "END Asante kwa kutumia tareka." if lang == "sw" else "END Thanks for using tareka."

    if choice == "1":
        if user:
            _audit_ussd(db, user, phone, session_id, action="register_existing")
            return "END Umesajiliwa tayari." if lang == "sw" else "END You are already registered."
        if len(parts) < 2:
            return "CON Enter your full name:"
        if len(parts) < 3:
            return "CON Choose language:\n1. English\n2. Swahili"

        full_name = parts[1][:120]
        selected_lang = parts[2]
        language = "sw" if selected_lang == "2" else "en"

        new_user = User(
            id=str(uuid4()),
            full_name=full_name or "tareka recycler",
            phone=phone,
            role="recycler",
            language=language,
            is_active=True,
            is_verified=False,
        )
        db.add(new_user)
        db.add(
            AuditLog(
                id=str(uuid4()),
                actor_user_id=new_user.id,
                action="ussd_register",
                entity_type="ussd",
                entity_id=new_user.id,
                metadata_json={"session_id": session_id[:36], "phone_suffix": phone[-4:]},
            )
        )
        db.commit()
        return "END Umejisajili kwenye tareka." if language == "sw" else "END Registration complete on tareka."

    if choice == "2":
        if not user:
            return "END Please register first." if lang == "en" else "END Tafadhali jisajili kwanza."
        rows = db.scalars(select(Wallet.token_balance).where(Wallet.user_id == user.id)).all()
        total_tokens = sum(rows, Decimal("0")) if rows else Decimal("0")
        _audit_ussd(db, user, phone, session_id, action="balance")
        if lang == "sw":
            return f"END Salio lako ni tokeni {total_tokens}."
        return f"END Your balance is {total_tokens} tokens."

    if choice == "3":
        _audit_ussd(db, user, phone, session_id, action="nearest_site")
        if lang == "sw":
            return "END Angalia vituo: https://tareka.app/sites"
        return "END View sites: https://tareka.app/sites"

    if choice == "4":
        if not user:
            return "END Please register first." if lang == "en" else "END Tafadhali jisajili kwanza."
        last_dropoff = db.scalars(
            select(Dropoff).where(Dropoff.recycler_id == user.id).order_by(desc(Dropoff.confirmed_at)).limit(1)
        ).first()
        _audit_ussd(db, user, phone, session_id, action="reward_status")
        if not last_dropoff:
            return "END No drop-offs yet." if lang == "en" else "END Hakuna drop-off bado."
        dynamic_en = f"Last drop-off: {last_dropoff.item_count} {last_dropoff.material_type}."
        if lang == "sw":
            translated = _translate_dynamic_fast(db, dynamic_en, "sw")
            return f"END {translated}"
        return f"END {dynamic_en}"

    return _MENU_SW if lang == "sw" else _MENU_EN


def _audit_ussd(db: Session, user: User | None, phone: str, session_id: str, action: str) -> None:
    db.add(
        AuditLog(
            id=str(uuid4()),
            actor_user_id=user.id if user else None,
            action="ussd_interaction",
            entity_type="ussd",
            entity_id=(user.id if user else "anonymous")[:36],
            metadata_json={
                "summary": action,
                "phone_suffix": phone[-4:],
                "session_id": session_id[:36],
            },
        )
    )
    db.commit()


def _translate_dynamic_fast(db: Session, text: str, target_language: str) -> str:
    """Best effort translation: never block USSD on async model calls."""
    try:
        asyncio.get_running_loop()
        return text
    except RuntimeError:
        pass

    def _worker() -> str:
        res = asyncio.run(
            translate_for_channel(
                db,
                text=text,
                target_language=target_language,
                channel="ussd",
                actor_user_id=None,
            )
        )
        return str(res.get("translated", text))

    with ThreadPoolExecutor(max_workers=1) as pool:
        fut = pool.submit(_worker)
        try:
            out = fut.result(timeout=0.25)
            return out or text
        except FutureTimeoutError:
            return text
        except Exception:
            return text
