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
  /** Set for company operators/admins; used for scoped dashboard APIs. */
  companyId?: string | null;
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
  company_id?: string | null;
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
  /** Directory-safe aggregates only; no identities or payout data. */
  public_impact: CompanyPublicImpactSummary;
}

/** Included on GET /companies/:id for public partner pages. */
export interface CompanyPublicImpactSummary {
  verified_dropoffs: number;
  total_estimated_weight_kg: number;
  estimated_weight_label: string;
  total_estimated_co2_avoided_kg: number;
  co2_estimate_label: string;
  is_estimate: boolean;
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

/** GET /impact/network — public ecosystem telemetry. */
export interface NetworkImpactActivityRow {
  confirmed_at: string;
  city: string;
  material_type: string;
  partner_name: string;
}

export interface NetworkRegionalMomentumRow {
  city: string;
  verified_dropoffs: number;
}

export interface NetworkMilestoneBlock {
  title: string;
  body: string;
}

export interface NetworkImpactExperience extends ImpactTotals {
  active_companies: number;
  active_recyclers: number;
  operational_hubs: number;
  recent_verified_activity: NetworkImpactActivityRow[];
  regional_momentum: NetworkRegionalMomentumRow[];
  milestones: NetworkMilestoneBlock[];
  momentum: {
    last_7d_verified_dropoffs: number;
    prior_7d_verified_dropoffs: number;
    trend: "up" | "down" | "steady";
  };
  generated_at: string;
}

export interface MaterialMixRow {
  material_type: string;
  estimated_kg: number;
  dropoffs: number;
}

export interface WeeklyIntakeRow {
  week_start: string;
  dropoff_count: number;
  estimated_kg: number;
}

export interface SiteSummaryRow {
  site_id: string;
  site_name: string;
  dropoff_count: number;
  estimated_kg: number;
}

/** Authenticated company dashboard aggregate (GET /company-dashboard/:id). */
export interface CompanyDashboardSummary extends ImpactTotals {
  distinct_recyclers: number;
  active_sites: number;
  material_mix: MaterialMixRow[];
  weekly_intake: WeeklyIntakeRow[];
  sites: SiteSummaryRow[];
  ledger_tip_hash: string | null;
  /** Pending KES for current ISO week (UTC), from payout ledger. */
  pending_kes_obligations_week: number;
}

export interface PayoutLedgerItem {
  id: string;
  company_id: string;
  user_id: string;
  amount_kes: number;
  status: string;
  due_date: string;
  paid_at: string | null;
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

export interface CompanyDropoffAdminItem extends DropoffItem {
  site_name: string;
  recycler_name: string;
  reward_type: string;
}

export interface PaginatedDropoffs {
  items: DropoffItem[];
  limit: number;
  offset: number;
  count: number;
}

export interface PaginatedCompanyDropoffs {
  items: CompanyDropoffAdminItem[];
  limit: number;
  offset: number;
  count: number;
}

/** GET /platform/operations (platform_admin only). */
export interface PlatformOperationsSnapshot {
  generated_at: string;
  platform_impact: ImpactTotals & { active_companies?: number };
  users: {
    active_recyclers: number;
    active_operators: number;
    operators_pending_verification: number;
  };
  companies: {
    active_businesses: number;
    pending_network_approval: number;
  };
  sites: { operational_hubs: number };
  onboarding: {
    pending_company_access_requests: number;
    recent_requests: PlatformCompanyAccessRequestRow[];
  };
  risk_signals: {
    failed_logins_7d: number;
    recent_failed_logins: { id: string; created_at: string; entity_id: string }[];
    automated_flagged_dropoffs: null;
    note: string;
  };
  partner_growth: { recent_companies: PlatformPartnerRow[] };
  regional_intake: { city: string; verified_dropoffs: number; estimated_kg: number }[];
  network_events: PlatformNetworkEventRow[];
  audit_tail: PlatformAuditRow[];
}

export interface PlatformCompanyAccessRequestRow {
  id: string;
  company_name: string;
  contact_person: string;
  work_email: string;
  industry: string;
  status: string;
  created_at: string;
}

export interface PlatformPartnerRow {
  id: string;
  name: string;
  slug: string;
  is_verified: boolean;
  is_approved: boolean;
  created_at: string;
}

export interface PlatformNetworkEventRow {
  id: string;
  confirmed_at: string;
  material_type: string;
  company_id: string;
  site_name: string;
  city: string;
  company_name: string;
}

export interface PlatformAuditRow {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  actor_user_id: string | null;
  created_at: string;
}

export interface WalletDetail {
  id: string;
  user_id: string;
  company_id: string;
  token_balance: string;
  lifetime_earned: string;
  lifetime_redeemed: string;
}

/** Generic pagination envelope (`/products/companies`, etc.) */
export interface PaginatedResponse<T> {
  items: T[];
  limit: number;
  offset: number;
  count: number;
}

/** GET /products/marketplace aggregated reward cards */
export interface MarketplaceListingItem {
  id: string;
  company_id: string;
  company_name: string;
  company_slug: string;
  partner_verified: boolean;
  partner_sats_program: boolean;
  title: string;
  short_description: string | null;
  image_url: string | null;
  price_kes: string | null;
  token_requirement: number | null;
  is_redeemable: boolean;
  is_discountable: boolean;
  environmental_category: string | null;
  reward_models: string[];
  availability_summary: string | null;
}

export interface MarketplaceFeedResponse {
  items: MarketplaceListingItem[];
  limit: number;
  offset: number;
  count: number;
  total: number;
}

/** GET /products/{id} reward detail — mirrors API schema subset used by marketplace */
export interface RewardEligibility {
  reward_type: string;
  label: string;
  is_eligible: boolean;
  reason: string | null;
}

export interface RewardContext {
  has_context: boolean;
  rewards: RewardEligibility[];
}

export interface ProductRewardDetail {
  id: string;
  company_id: string;
  company_name: string;
  company_slug: string | null;
  title: string;
  short_description: string | null;
  description: string | null;
  material_story: string | null;
  materials_used: unknown[] | null;
  product_story: Record<string, unknown> | null;
  image_url: string | null;
  price_kes: string | null;
  token_requirement: number | null;
  token_discount_value: string | null;
  is_redeemable: boolean;
  is_discountable: boolean;
  availability: unknown[] | null;
  is_published: boolean;
  user_token_balance?: number | null;
  reward_context?: RewardContext | null;
}

export interface ProductRedeemResponse {
  redemption_id: string;
  product_id: string;
  product_title: string;
  company_name: string;
  tokens_spent: string;
  message: string;
  instructions_snapshot: string | null;
}

export interface RewardRedemptionHistoryItem {
  id: string;
  product_id: string;
  product_title: string;
  company_name: string;
  company_slug: string;
  tokens_spent: string;
  instructions_snapshot: string | null;
  created_at: string;
}

export interface RedemptionHistoryResponse {
  items: RewardRedemptionHistoryItem[];
  limit: number;
  offset: number;
  count: number;
  total: number;
}

/** Catalogue by partner slug — reuses pagination shape */
export interface CompanyCatalogueResponse {
  company: CompanyProductSummary;
  products: PaginatedRewards;
}

export interface CompanyProductSummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_verified: boolean;
  location: CompanyLocationSummary;
  image_url: string | null;
  product_count: number;
  region_label?: string | null;
  materials_preview?: string[];
  reward_offerings?: string[];
}

export interface CompanyLocationSummary {
  country: string | null;
  city: string | null;
  area: string | null;
  formatted_address: string | null;
}

export interface RewardListItem {
  id: string;
  company_id: string;
  title: string;
  short_description: string | null;
  image_url: string | null;
  materials_used: unknown[] | null;
  price_kes: string | null;
  token_requirement: number | null;
  is_redeemable: boolean;
  is_discountable: boolean;
}

export interface PaginatedRewards {
  items: RewardListItem[];
  limit: number;
  offset: number;
  count: number;
}

/** Optional Lightning / batch payout placeholders (preferences only — not a custodial wallet). */
export interface RecyclerSatsPayoutPreferences {
  lightning_address_placeholder: string | null;
  low_connectivity_opt_in: boolean;
}

export interface SatPayoutActivityRow {
  id: string;
  company_id: string;
  company_name?: string | null;
  sats_amount: number;
  status: string;
  payout_rail: string | null;
  created_at: string;
}

export interface RecyclerSatsParticipationSummary {
  framing_note: string;
  pending_total_sats: number;
  sent_total_sats: number;
  failed_total_sats: number;
  pending_count: number;
  recent_activity: SatPayoutActivityRow[];
}

export interface SatsRewardRailsReference {
  rails: string[];
}
