import type { NetworkImpactExperience } from "@/types";

/** Public network intelligence — shown when GET /impact/network is unavailable. */
export const NETWORK_MOCK_EXPERIENCE: NetworkImpactExperience = {
  verified_dropoffs: 4_218,
  total_estimated_weight_kg: 18_640,
  estimated_weight_label: "operator-estimated",
  total_estimated_co2_avoided_kg: 9_320,
  co2_estimate_label: "methodological estimate",
  is_estimate: true,
  active_companies: 14,
  active_recyclers: 892,
  operational_hubs: 11,
  momentum: {
    last_7d_verified_dropoffs: 312,
    prior_7d_verified_dropoffs: 278,
    trend: "up",
  },
  milestones: [
    {
      title: "Nairobi corridor crossed 4,000 verified contributions",
      body: "Operator-confirmed intake across Westlands, Kilimani, and Eastlands hubs.",
    },
    {
      title: "Three new product partners joined the rewards catalogue",
      body: "Recycled goods from Nairobi manufacturers now redeemable with tareka tokens.",
    },
  ],
  regional_momentum: [
    { city: "Nairobi", verified_dropoffs: 248 },
    { city: "Kiambu", verified_dropoffs: 41 },
    { city: "Machakos", verified_dropoffs: 23 },
  ],
  recent_verified_activity: [
    {
      confirmed_at: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
      city: "Nairobi",
      material_type: "plastic",
      partner_name: "EcoPost Kenya",
    },
    {
      confirmed_at: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
      city: "Nairobi",
      material_type: "glass",
      partner_name: "Kilimani Neighbourhood Point",
    },
    {
      confirmed_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      city: "Nairobi",
      material_type: "paper",
      partner_name: "GreenCycle Westlands",
    },
    {
      confirmed_at: new Date(Date.now() - 1000 * 60 * 320).toISOString(),
      city: "Nairobi",
      material_type: "metal",
      partner_name: "Eastlands Collection Hub",
    },
    {
      confirmed_at: new Date(Date.now() - 1000 * 60 * 510).toISOString(),
      city: "Kiambu",
      material_type: "electronics",
      partner_name: "Ruiru E-Waste Point",
    },
  ],
  generated_at: new Date().toISOString(),
};
