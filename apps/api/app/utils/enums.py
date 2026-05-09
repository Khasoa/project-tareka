from enum import Enum


class UserRole(str, Enum):
    recycler = "recycler"
    operator = "operator"
    company_admin = "company_admin"
    platform_admin = "platform_admin"


class LanguageCode(str, Enum):
    en = "en"
    sw = "sw"


class RewardType(str, Enum):
    tokens = "tokens"
    kes = "kes"
    sats = "sats"


class MaterialType(str, Enum):
    plastic_bottle = "plastic_bottle"
    glass_bottle = "glass_bottle"
    can = "can"
    paper = "paper"
    ewaste = "ewaste"


class PayoutStatus(str, Enum):
    pending = "pending"
    confirmed_paid = "confirmed_paid"
    disputed = "disputed"


class SatPayoutStatus(str, Enum):
    pending = "pending"
    sent = "sent"
    failed = "failed"


class SatsRewardRail(str, Enum):
    """How a partner intends to settle participation sats (infra hint, not a trading product)."""

    unspecified = "unspecified"
    kotani_compatible = "kotani_compatible"
    lightning_batch = "lightning_batch"
    low_connectivity_batch = "low_connectivity_batch"
    manual_reconciliation = "manual_reconciliation"


class FraudStatus(str, Enum):
    open = "open"
    reviewed = "reviewed"
    dismissed = "dismissed"
