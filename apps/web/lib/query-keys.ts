export const queryKeys = {
  me: ["auth", "me"] as const,
  companies: (params: { city?: string; nearLat?: number; nearLng?: number }) =>
    ["companies", params] as const,
  company: (id: string) => ["company", id] as const,
  companyImpact: (id: string) => ["impact", "company", id] as const,
  recyclerImpact: (id: string) => ["impact", "recycler", id] as const,
  recyclerDropoffs: (id: string, limit: number, offset: number) =>
    ["dropoffs", "recycler", id, limit, offset] as const,
  wallet: (id: string) => ["wallet", id] as const,
};
