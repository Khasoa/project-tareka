import type { CompanyDetail, CompanyListItem } from "@/types";

/** Extra fields for client-side filtering until the API owns city/area. */
export type DirectoryListing = CompanyListItem & {
  city: string;
  area?: string;
  materials?: string[];
  /** Demo distance when geolocation API is not wired */
  distance_km_mock?: number;
};

/**
 * Mock directory listings — merged with live API when present; used alone when
 * the directory endpoint is empty or unavailable.
 */
export const DIRECTORY_MOCK_LISTINGS: DirectoryListing[] = [
  {
    id: "mock-company-eastlands",
    name: "Eastlands Collection Hub",
    slug: "eastlands-collection-hub",
    description:
      "Drop-off for plastics, metals, and paper. Operator-verified receipts during business hours.",
    is_verified: true,
    city: "Nairobi",
    area: "Eastlands",
    materials: ["plastic", "metal", "paper"],
    distance_km_mock: 1.1,
  },
  {
    id: "mock-company-kilimani",
    name: "Kilimani Neighbourhood Point",
    slug: "kilimani-neighbourhood-point",
    description:
      "Compact site for household recyclables. Estimated weights recorded at handover.",
    is_verified: true,
    city: "Nairobi",
    area: "Kilimani",
    materials: ["plastic", "glass", "paper"],
    distance_km_mock: 2.4,
  },
  {
    id: "mock-company-westlands",
    name: "GreenCycle Westlands",
    slug: "greencycle-westlands",
    description:
      "Glass and paper recovery with same-day weigh-in. Partner rewards catalogue on site.",
    is_verified: true,
    city: "Nairobi",
    area: "Westlands",
    materials: ["glass", "paper", "plastic"],
    distance_km_mock: 3.2,
  },
  {
    id: "mock-company-industrial",
    name: "EcoPost Kenya — Industrial Area",
    slug: "ecopost-kenya",
    description:
      "HDPE and mixed plastics intake for recycled lumber production. Bulk drop-offs welcome.",
    is_verified: true,
    city: "Nairobi",
    area: "Industrial Area",
    materials: ["plastic", "metal"],
    distance_km_mock: 5.8,
  },
  {
    id: "mock-company-karen",
    name: "Karen Green Drop",
    slug: "karen-green-drop",
    description:
      "Residential collection point for glass, textiles, and electronics. Weekend hours.",
    is_verified: true,
    city: "Nairobi",
    area: "Karen",
    materials: ["glass", "textiles", "electronics"],
    distance_km_mock: 8.1,
  },
  {
    id: "mock-company-ruiru",
    name: "Ruiru E-Waste Point",
    slug: "ruiru-ewaste",
    description:
      "Electronics take-back and metal recovery serving Kiambu county commuters.",
    is_verified: false,
    city: "Kiambu",
    area: "Ruiru",
    materials: ["electronics", "metal", "plastic"],
    distance_km_mock: 12.4,
  },
  {
    id: "mock-company-mombasa-old-town",
    name: "Mombasa Old Town Partner",
    slug: "mombasa-old-town-partner",
    description: "Coastal collection partner — glass and plastics focus.",
    is_verified: false,
    city: "Mombasa",
    area: "Old Town",
    materials: ["glass", "plastic"],
    distance_km_mock: 4.2,
  },
  {
    id: "mock-company-kisumu",
    name: "Kisumu Lakeside Recycling",
    slug: "kisumu-lakeside-recycling",
    description: "Regional hub for verified drop-offs and weigh-ins.",
    is_verified: true,
    city: "Kisumu",
    materials: ["plastic", "paper", "metal"],
    distance_km_mock: 3.0,
  },
];

export function getMockDirectoryListing(id: string): DirectoryListing | undefined {
  return DIRECTORY_MOCK_LISTINGS.find((l) => l.id === id);
}

export function mockCompanyDetailFromListing(listing: DirectoryListing): CompanyDetail {
  const dropoffs = 80 + listing.name.length * 3;
  return {
    id: listing.id,
    name: listing.name,
    slug: listing.slug,
    description: listing.description,
    is_active: true,
    is_verified: listing.is_verified,
    public_impact: {
      verified_dropoffs: dropoffs,
      total_estimated_weight_kg: dropoffs * 4.2,
      estimated_weight_label: "operator-estimated",
      total_estimated_co2_avoided_kg: dropoffs * 2.1,
      co2_estimate_label: "methodological estimate",
      is_estimate: true,
    },
  };
}

/** Featured sites for landing preview — first N Nairobi listings. */
export function featuredMockSites(limit = 2): CompanyListItem[] {
  return DIRECTORY_MOCK_LISTINGS.filter((l) => l.city === "Nairobi")
    .slice(0, limit)
    .map(({ id, name, slug, description, is_verified }) => ({
      id,
      name,
      slug,
      description,
      is_verified,
    }));
}
