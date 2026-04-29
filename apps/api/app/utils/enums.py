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


class FraudStatus(str, Enum):
    open = "open"
    reviewed = "reviewed"
    dismissed = "dismissed"
