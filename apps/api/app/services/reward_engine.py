from __future__ import annotations

from datetime import datetime, timedelta, timezone
from decimal import Decimal
from uuid import uuid4

from sqlalchemy.orm import Session

from app.models.company import Company
from app.models.dropoff import Dropoff
from app.models.payout_ledger import PayoutLedger
from app.models.reward_transaction import RewardTransaction
from app.models.sat_payout import SatPayout
from app.utils.enums import PayoutStatus, RewardType, SatPayoutStatus
from app.services.wallet_service import WalletService
from app.utils.material_config import (
    calculate_tokens,
    kes_obligation_per_dropoff,
    sats_pending_per_dropoff,
)


def issue_reward(db: Session, dropoff: Dropoff, company: Company) -> dict[str, Decimal | int]:
    """Apply enabled company reward channels. All DB writes use the current transaction."""
    summary: dict[str, Decimal | int] = {
        "tokens": Decimal("0"),
        "kes_obligation": Decimal("0"),
        "sats_pending": 0,
    }
    wallet_service = WalletService(db)

    if company.reward_tokens_enabled:
        tokens = _token_amount_for_dropoff(dropoff, company)
        summary["tokens"] = tokens
        wallet = wallet_service.create_wallet_if_missing(dropoff.recycler_id, dropoff.company_id)
        wallet_service.add_tokens(wallet, tokens, dropoff.id)
        txn = RewardTransaction(
            id=str(uuid4()),
            wallet_id=wallet.id,
            dropoff_id=dropoff.id,
            reward_type=RewardType.tokens.value,
            amount=tokens,
            description="Drop-off token reward",
        )
        db.add(txn)

    if company.reward_kes_enabled:
        kes = kes_obligation_per_dropoff(dropoff.material_type, dropoff.item_count)
        summary["kes_obligation"] = kes
        due = datetime.now(timezone.utc) + timedelta(days=7)
        ledger = PayoutLedger(
            id=str(uuid4()),
            company_id=dropoff.company_id,
            user_id=dropoff.recycler_id,
            amount_kes=kes,
            status=PayoutStatus.pending.value,
            due_date=due,
        )
        db.add(ledger)

    if company.reward_sats_enabled:
        sats = sats_pending_per_dropoff(dropoff.material_type, dropoff.item_count)
        summary["sats_pending"] = sats
        payout = SatPayout(
            id=str(uuid4()),
            user_id=dropoff.recycler_id,
            company_id=dropoff.company_id,
            dropoff_id=dropoff.id,
            sats_amount=sats,
            status=SatPayoutStatus.pending.value,
        )
        db.add(payout)

    _set_dropoff_reward_denormalized(dropoff, company, summary)
    dropoff.reward_issued = True
    return summary


def _token_amount_for_dropoff(dropoff: Dropoff, company: Company) -> Decimal:
    """Single source of truth for token rewards (material + count + optional company multipliers)."""
    multis = getattr(company, "token_reward_multipliers", None)
    if not isinstance(multis, dict):
        multis = None
    return calculate_tokens(dropoff.material_type, dropoff.item_count, multis)


def _set_dropoff_reward_denormalized(
    dropoff: Dropoff, company: Company, summary: dict[str, Decimal | int]
) -> None:
    """Persist legacy single reward_type/reward_amount for reporting (not combined logic)."""
    if company.reward_tokens_enabled and summary["tokens"] > 0:
        dropoff.reward_type = RewardType.tokens.value
        dropoff.reward_amount = Decimal(summary["tokens"])
    elif company.reward_kes_enabled and summary["kes_obligation"] > 0:
        dropoff.reward_type = RewardType.kes.value
        dropoff.reward_amount = Decimal(summary["kes_obligation"])
    elif company.reward_sats_enabled and summary["sats_pending"]:
        dropoff.reward_type = RewardType.sats.value
        dropoff.reward_amount = Decimal(int(summary["sats_pending"]))
    else:
        dropoff.reward_type = RewardType.tokens.value
        dropoff.reward_amount = Decimal("0")
