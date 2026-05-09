import type { CompanyListItem } from "@/types";

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
