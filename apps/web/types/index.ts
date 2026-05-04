export type UserRole = "recycler" | "operator" | "company_admin" | "platform_admin";

export interface User {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: UserRole;
  language: string;
  isActive: boolean;
  isVerified: boolean;
}

/** Raw `/auth/me` JSON (FastAPI default serialization). */
export interface UserResponseRaw {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: string;
  language: string;
  is_active: boolean;
  is_verified: boolean;
}

export interface CompanyListItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_verified: boolean;
}

export interface CompanyDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  is_verified: boolean;
}

export interface ImpactTotals {
  total_estimated_weight_kg: number;
  estimated_weight_label: string;
  total_estimated_co2_avoided_kg: number;
  co2_estimate_label: string;
  verified_dropoffs: number;
  is_estimate: boolean;
  active_companies?: number;
  recycler_id?: string;
  company_id?: string;
}

export interface RewardSummary {
  tokens: string;
  kes_obligation: string;
  sats_pending: number;
}

export interface DropoffItem {
  id: string;
  site_id: string;
  company_id: string;
  recycler_id: string;
  operator_id: string;
  material_type: string;
  item_count: number;
  estimated_weight_kg: number | null;
  estimated_weight_label: string;
  co2_avoided_kg: number | null;
  co2_estimate_label: string;
  confirmed_at: string;
  reward_issued: boolean;
  reward_summary: RewardSummary | null;
}

export interface PaginatedDropoffs {
  items: DropoffItem[];
  limit: number;
  offset: number;
  count: number;
}

export interface WalletDetail {
  id: string;
  user_id: string;
  company_id: string;
  token_balance: string;
  lifetime_earned: string;
  lifetime_redeemed: string;
}
