export const queryKeys = {
  me: ["auth", "me"] as const,
  companies: (params: { country?: string; city?: string; nearLat?: number; nearLng?: number }) =>
    ["companies", params] as const,
  company: (id: string) => ["company", id] as const,
  networkImpact: ["impact", "network"] as const,
  companyDashboard: (id: string) => ["company-dashboard", id] as const,
  companyDropoffs: (id: string, limit: number, offset: number) =>
    ["dropoffs", "company", id, limit, offset] as const,
  companyPayoutsWeekly: (id: string, weekOf: string) =>
    ["payouts", "company", "weekly", id, weekOf] as const,
  recyclerImpact: (id: string) => ["impact", "recycler", id] as const,
  recyclerDropoffs: (id: string, limit: number, offset: number) =>
    ["dropoffs", "recycler", id, limit, offset] as const,
  platformOperations: ["platform", "operations"] as const,
  wallet: (id: string) => ["wallet", id] as const,
  walletProgramForCompany: (userId: string, companyId: string) =>
    ["wallet-program", userId, companyId] as const,
  partnerCatalogueSlug: (slug: string, limit: number, offset: number) =>
    ["partner-catalogue-slug", slug, limit, offset] as const,
  productReward: (id: string) => ["product-reward", id] as const,
  myRedemptions: (limit: number, offset: number) =>
    ["my-redemptions", limit, offset] as const,
  marketplacePartnerStrip: ["marketplace-partner-strip"] as const,
  satsPreferences: ["reward-channels", "sats", "preferences"] as const,
  satsSummary: ["reward-channels", "sats", "summary"] as const,
  operatorSites: ["operators", "sites"] as const,
  operatorRecyclerSearch: (q: string) => ["operators", "recyclers", "search", q] as const,
  siteRewardContext: (siteId: string) =>
    ["operators", "sites", siteId, "reward-context"] as const,
  siteDropoffs: (siteId: string, limit: number, offset: number) =>
    ["dropoffs", "site", siteId, limit, offset] as const,
  companyRewards: (companyId: string) => ["company-rewards", companyId] as const,
};
