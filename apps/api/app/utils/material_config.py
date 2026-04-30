from __future__ import annotations

from decimal import Decimal

from app.utils.enums import MaterialType

MATERIAL_MULTIPLIERS: dict[str, int] = {
    "plastic_bottle": 5,
    "glass_bottle": 7,
    "can": 10,
    "paper": 4,
    "ewaste": 20,
}

MATERIAL_AVG_WEIGHT_KG: dict[str, Decimal] = {
    "plastic_bottle": Decimal("0.025"),
    "glass_bottle": Decimal("0.300"),
    "can": Decimal("0.015"),
    "paper": Decimal("0.100"),
    "ewaste": Decimal("0.500"),
}

CO2_FACTORS_KG: dict[str, Decimal] = {
    "plastic_bottle": Decimal("2.29"),
    "glass_bottle": Decimal("0.31"),
    "can": Decimal("9.10"),
    "paper": Decimal("0.94"),
    "ewaste": Decimal("1.53"),
}

MATERIAL_KES_PER_ITEM: dict[str, Decimal] = {
    "plastic_bottle": Decimal("2"),
    "glass_bottle": Decimal("3"),
    "can": Decimal("4"),
    "paper": Decimal("1"),
    "ewaste": Decimal("10"),
}

MATERIAL_SATS_PER_ITEM: dict[str, int] = {
    "plastic_bottle": 50,
    "glass_bottle": 70,
    "can": 100,
    "paper": 40,
    "ewaste": 200,
}


def _material_key(material: str | MaterialType) -> str:
    if isinstance(material, MaterialType):
        return material.value
    return str(material)


def estimate_weight(material: str | MaterialType, item_count: int) -> Decimal:
    key = _material_key(material)
    per_item = MATERIAL_AVG_WEIGHT_KG[key]
    return per_item * Decimal(item_count)


def estimate_co2(material: str | MaterialType, item_count: int) -> Decimal:
    key = _material_key(material)
    weight_kg = estimate_weight(key, item_count)
    factor = CO2_FACTORS_KG[key]
    return weight_kg * factor


def calculate_tokens(
    material: str | MaterialType,
    item_count: int,
    company_multipliers: dict[str, int] | None = None,
) -> Decimal:
    key = _material_key(material)
    base = MATERIAL_MULTIPLIERS[key]
    mult = base
    if company_multipliers and key in company_multipliers:
        mult = company_multipliers[key]
    return Decimal(mult * item_count)


def kes_obligation_per_dropoff(material: str | MaterialType, item_count: int) -> Decimal:
    key = _material_key(material)
    return MATERIAL_KES_PER_ITEM[key] * Decimal(item_count)


def sats_pending_per_dropoff(material: str | MaterialType, item_count: int) -> int:
    key = _material_key(material)
    return MATERIAL_SATS_PER_ITEM[key] * item_count
