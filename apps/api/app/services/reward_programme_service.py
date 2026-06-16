from __future__ import annotations

import copy
from datetime import datetime, timezone
from decimal import ROUND_HALF_UP, Decimal
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.company import Company
from app.models.dropoff import Dropoff
from app.models.reward_transaction import RewardTransaction
from app.models.user import User
from app.models.wallet import Wallet
from app.schemas.company_rewards import MaterialRewardRule, RewardProgrammePatch
from app.utils.enums import MaterialType, RewardType
from app.utils.material_config import MATERIAL_AVG_WEIGHT_KG, calculate_tokens, sats_pending_per_dropoff

MATERIAL_KEYS: tuple[str, ...] = tuple(m.value for m in MaterialType)

REWARD_MODES: frozenset[str] = frozenset(
    {
        "tareka_tokens",
        "sats_rewards",
        "discount_vouchers",
        "marketplace_redemption_only",
        "recognition_only",
    }
)


def default_reward_programme_dict() -> dict[str, Any]:
    return {
        "programme_enabled": True,
        "reward_mode": "tareka_tokens",
        "material_rules": {},
        "redemption": {
            "allow_marketplace_redemption": True,
            "allow_sats_payout": False,
            "minimum_balance_tokens": 0,
            "pending_verification_required": False,
        },
    }


def normalized_reward_programme(raw: dict | None) -> dict[str, Any]:
    """Canonical programme dict used at runtime (merged with defaults)."""
    cfg = default_reward_programme_dict()
    if not raw or not isinstance(raw, dict):
        return cfg

    if isinstance(raw.get("programme_enabled"), bool):
        cfg["programme_enabled"] = raw["programme_enabled"]

    mode = raw.get("reward_mode")
    if isinstance(mode, str) and mode in REWARD_MODES:
        cfg["reward_mode"] = mode

    mr_in = raw.get("material_rules")
    if isinstance(mr_in, dict):
        cleaned_mr: dict[str, Any] = {}
        for key in MATERIAL_KEYS:
            if key not in mr_in or not isinstance(mr_in[key], dict):
                continue
            cell = mr_in[key]
            cleaned_rule: dict[str, Any] = {}
            for fld in ("tokens_per_kg", "sats_per_kg", "min_threshold_kg"):
                if cell.get(fld) is not None:
                    cleaned_rule[fld] = str(Decimal(str(cell[fld])))
            if cell.get("monthly_cap_tokens") is not None:
                cleaned_rule["monthly_cap_tokens"] = int(cell["monthly_cap_tokens"])
            if cleaned_rule:
                cleaned_mr[key] = cleaned_rule
        cfg["material_rules"] = cleaned_mr

    red_in = raw.get("redemption")
    if isinstance(red_in, dict):
        red = copy.deepcopy(cfg["redemption"])
        if isinstance(red_in.get("allow_marketplace_redemption"), bool):
            red["allow_marketplace_redemption"] = red_in["allow_marketplace_redemption"]
        if isinstance(red_in.get("allow_sats_payout"), bool):
            red["allow_sats_payout"] = red_in["allow_sats_payout"]
        if red_in.get("minimum_balance_tokens") is not None:
            red["minimum_balance_tokens"] = max(0, int(red_in["minimum_balance_tokens"]))
        if isinstance(red_in.get("pending_verification_required"), bool):
            red["pending_verification_required"] = red_in["pending_verification_required"]
        cfg["redemption"] = red

    return cfg


def merge_reward_programme_config(raw: dict | None) -> dict[str, Any]:
    """Alias for compatibility with readers expecting merge_* naming."""
    return normalized_reward_programme(raw)


def sync_company_reward_booleans(company: Company, cfg: dict[str, Any]) -> None:
    t, s, k = derive_reward_booleans(cfg)
    company.reward_tokens_enabled = t
    company.reward_sats_enabled = s
    company.reward_kes_enabled = k


def derive_reward_booleans(cfg: dict[str, Any]) -> tuple[bool, bool, bool]:
    if not cfg["programme_enabled"]:
        return False, False, False
    mode = cfg["reward_mode"]
    red = cfg.get("redemption") or {}
    tokens = mode in (
        "tareka_tokens",
        "discount_vouchers",
        "marketplace_redemption_only",
    )
    sats = mode == "sats_rewards" or (mode == "tareka_tokens" and bool(red.get("allow_sats_payout")))
    kes = False
    return tokens, sats, kes


def programme_blocks_financial_recognition(cfg: dict[str, Any], recycler: User | None) -> bool:
    if not recycler:
        return True
    if not recycler.is_active:
        return True
    red = cfg.get("redemption") or {}
    if red.get("pending_verification_required") and not recycler.is_verified:
        return True
    return False


def _rule_for_material(cfg: dict[str, Any], material_type: str) -> dict[str, Any]:
    rules = cfg.get("material_rules") or {}
    raw = rules.get(material_type)
    return raw if isinstance(raw, dict) else {}


def monthly_tokens_issued_for_material(
    db: Session,
    recycler_id: str,
    company_id: str,
    material_type: str,
) -> Decimal:
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    total = db.scalar(
        select(func.coalesce(func.sum(RewardTransaction.amount), 0))
        .join(Wallet, Wallet.id == RewardTransaction.wallet_id)
        .join(Dropoff, Dropoff.id == RewardTransaction.dropoff_id)
        .where(
            Wallet.user_id == recycler_id,
            Wallet.company_id == company_id,
            Dropoff.material_type == material_type,
            RewardTransaction.reward_type == RewardType.tokens.value,
            RewardTransaction.created_at >= month_start,
        )
    )
    return Decimal(str(total or 0))


def compute_dropoff_tokens(db: Session, dropoff: Dropoff, cfg: dict[str, Any]) -> Decimal:
    material = dropoff.material_type
    rule = _rule_for_material(cfg, material)
    weight_kg = dropoff.estimated_weight_kg
    if weight_kg is None:
        weight_kg = Decimal("0")

    tokens = Decimal("0")
    if rule.get("tokens_per_kg") is not None:
        rate = Decimal(str(rule["tokens_per_kg"]))
        tokens = (Decimal(str(weight_kg)) * rate).quantize(Decimal("0.01"))
        min_kg = rule.get("min_threshold_kg")
        if min_kg is not None and Decimal(str(weight_kg)) < Decimal(str(min_kg)):
            tokens = Decimal("0")
    else:
        tokens = calculate_tokens(material, dropoff.item_count, None)

    cap = rule.get("monthly_cap_tokens")
    if cap is not None and tokens > 0:
        issued = monthly_tokens_issued_for_material(db, dropoff.recycler_id, dropoff.company_id, material)
        remaining = Decimal(int(cap)) - issued
        if remaining <= 0:
            tokens = Decimal("0")
        else:
            tokens = min(tokens, remaining)

    if tokens < 0:
        return Decimal("0")
    return tokens.quantize(Decimal("0.01"))


def compute_dropoff_sats(dropoff: Dropoff, _company: Company, cfg: dict[str, Any]) -> int:
    material = dropoff.material_type
    rule = _rule_for_material(cfg, material)
    weight_kg = dropoff.estimated_weight_kg
    if weight_kg is None:
        weight_kg = Decimal("0")

    if rule.get("sats_per_kg") is not None:
        rate = Decimal(str(rule["sats_per_kg"]))
        return int((Decimal(str(weight_kg)) * rate).to_integral_value(rounding=ROUND_HALF_UP))
    return sats_pending_per_dropoff(material, dropoff.item_count)


def estimate_preview_tokens(company: Company, material_type: str, weight_kg: Decimal) -> Decimal:
    cfg = normalized_reward_programme(company.reward_programme_config)
    rule = _rule_for_material(cfg, material_type)
    if rule.get("tokens_per_kg") is not None:
        rate = Decimal(str(rule["tokens_per_kg"]))
        tokens = (weight_kg * rate).quantize(Decimal("0.01"))
        min_kg = rule.get("min_threshold_kg")
        if min_kg is not None and weight_kg < Decimal(str(min_kg)):
            return Decimal("0")
        return tokens
    per_item_w = MATERIAL_AVG_WEIGHT_KG.get(material_type)
    if per_item_w is None or per_item_w <= 0:
        return Decimal("0")
    items = max(1, int((weight_kg / per_item_w).to_integral_value(rounding=ROUND_HALF_UP)))
    return calculate_tokens(material_type, items, None)


def estimate_preview_sats(company: Company, material_type: str, weight_kg: Decimal) -> int:
    cfg = normalized_reward_programme(company.reward_programme_config)
    rule = _rule_for_material(cfg, material_type)
    if rule.get("sats_per_kg") is not None:
        rate = Decimal(str(rule["sats_per_kg"]))
        return int((weight_kg * rate).to_integral_value(rounding=ROUND_HALF_UP))
    per_item_w = MATERIAL_AVG_WEIGHT_KG.get(material_type)
    if per_item_w is None or per_item_w <= 0:
        return 0
    items = max(1, int((weight_kg / per_item_w).to_integral_value(rounding=ROUND_HALF_UP)))
    return sats_pending_per_dropoff(material_type, items)


def _serialize_material_rule(rule: dict[str, Any]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for fld in ("tokens_per_kg", "sats_per_kg", "min_threshold_kg"):
        if rule.get(fld) is not None:
            out[fld] = str(Decimal(str(rule[fld])))
    if rule.get("monthly_cap_tokens") is not None:
        out["monthly_cap_tokens"] = int(rule["monthly_cap_tokens"])
    return out


def apply_reward_programme_patch(db: Session, company: Company, patch: RewardProgrammePatch) -> dict[str, Any]:
    base = normalized_reward_programme(company.reward_programme_config)
    upd = patch.model_dump(exclude_unset=True, mode="python")

    if "programme_enabled" in upd:
        base["programme_enabled"] = bool(upd["programme_enabled"])
    if "reward_mode" in upd and upd["reward_mode"] is not None:
        if upd["reward_mode"] not in REWARD_MODES:
            raise ValueError("Invalid reward_mode")
        base["reward_mode"] = upd["reward_mode"]
    if "redemption" in upd and upd["redemption"] is not None:
        base["redemption"] = {**base["redemption"], **upd["redemption"]}

    if "material_rules" in upd and upd["material_rules"] is not None:
        mr = copy.deepcopy(base["material_rules"])
        for mat, rule_obj in upd["material_rules"].items():
            if mat not in MATERIAL_KEYS:
                continue
            if rule_obj is None:
                mr.pop(mat, None)
                continue
            if isinstance(rule_obj, MaterialRewardRule):
                rd = rule_obj.model_dump(exclude_none=True)
            elif isinstance(rule_obj, dict):
                rd = rule_obj
            else:
                continue
            if not any(
                rd.get(k) is not None
                for k in ("tokens_per_kg", "sats_per_kg", "min_threshold_kg", "monthly_cap_tokens")
            ):
                mr.pop(mat, None)
            else:
                mr[mat] = _serialize_material_rule(rd)
        base["material_rules"] = mr

    final_cfg = normalized_reward_programme(base)
    sync_company_reward_booleans(company, final_cfg)
    company.reward_programme_config = final_cfg
    db.add(company)
    db.commit()
    db.refresh(company)
    return final_cfg


def response_from_company(company: Company) -> dict[str, Any]:
    cfg = normalized_reward_programme(company.reward_programme_config)
    t, s, k = derive_reward_booleans(cfg)
    mr_models: dict[str, Any] = {}
    for key in MATERIAL_KEYS:
        rule = _rule_for_material(cfg, key)
        if rule:
            mr_models[key] = rule
    return {
        "programme_enabled": cfg["programme_enabled"],
        "reward_mode": cfg["reward_mode"],
        "material_rules": mr_models,
        "redemption": cfg["redemption"],
        "reward_tokens_enabled": t,
        "reward_sats_enabled": s,
        "reward_kes_enabled": k,
    }


def marketplace_redemption_allowed(company: Company) -> bool:
    cfg = normalized_reward_programme(company.reward_programme_config)
    if not cfg["programme_enabled"]:
        return False
    red = cfg.get("redemption") or {}
    return bool(red.get("allow_marketplace_redemption", True))


def minimum_balance_reserve_tokens(company: Company) -> int:
    cfg = normalized_reward_programme(company.reward_programme_config)
    red = cfg.get("redemption") or {}
    return max(0, int(red.get("minimum_balance_tokens") or 0))
