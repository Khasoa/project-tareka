/**
 * Mirrors `apps/api/app/utils/material_config.py` for client-side intake previews.
 */
export type BackendMaterialType = "plastic_bottle" | "glass_bottle" | "can" | "paper" | "ewaste";

const AVG_WEIGHT_KG: Record<BackendMaterialType, number> = {
  plastic_bottle: 0.025,
  glass_bottle: 0.3,
  can: 0.015,
  paper: 0.1,
  ewaste: 0.5,
};

const CO2_FACTORS_KG: Record<BackendMaterialType, number> = {
  plastic_bottle: 2.29,
  glass_bottle: 0.31,
  can: 9.1,
  paper: 0.94,
  ewaste: 1.53,
};

const MATERIAL_MULTIPLIERS: Record<BackendMaterialType, number> = {
  plastic_bottle: 5,
  glass_bottle: 7,
  can: 10,
  paper: 4,
  ewaste: 20,
};

export function estimateWeightKg(material: BackendMaterialType, itemCount: number): number {
  return AVG_WEIGHT_KG[material] * itemCount;
}

export function estimateCo2Kg(material: BackendMaterialType, itemCount: number): number {
  return estimateWeightKg(material, itemCount) * CO2_FACTORS_KG[material];
}

export function estimateBaseTokens(material: BackendMaterialType, itemCount: number): number {
  return MATERIAL_MULTIPLIERS[material] * itemCount;
}

export function avgWeightPerItemKg(material: BackendMaterialType): number {
  return AVG_WEIGHT_KG[material];
}
