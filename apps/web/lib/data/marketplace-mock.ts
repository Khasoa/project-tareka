import type { CompanyCatalogueResponse, CompanyProductSummary, RewardListItem } from "@/types";

const NAIVASI = { country: "Kenya", city: "Nairobi", area: null, formatted_address: "Nairobi, Kenya" };

function reward(
  id: string,
  companyId: string,
  title: string,
  desc: string,
  materials: string[],
  price: string,
  tokens: number,
): RewardListItem {
  return {
    id,
    company_id: companyId,
    title,
    short_description: desc,
    image_url: null,
    materials_used: materials,
    price_kes: price,
    token_requirement: tokens,
    is_redeemable: true,
    is_discountable: false,
  };
}

export const MARKETPLACE_MOCK_PARTNERS: CompanyProductSummary[] = [
  {
    id: "mock-mk-ecopost",
    name: "EcoPost Kenya",
    slug: "ecopost-kenya",
    description:
      "Turns collected HDPE and mixed plastics into durable fence posts, decking, and garden edging — made in Nairobi from verified drop-offs.",
    is_verified: true,
    location: { ...NAIVASI, area: "Industrial Area" },
    image_url: null,
    product_count: 3,
    region_label: "Nairobi",
    materials_preview: ["Plastic", "HDPE", "Mixed plastics"],
    reward_offerings: ["Recycled lumber", "Fence posts", "Garden edging"],
  },
  {
    id: "mock-mk-greencycle",
    name: "GreenCycle Westlands",
    slug: "greencycle-westlands",
    description:
      "Glass and paper recovery hub offering recycled stationery, glass aggregate, and household sorting kits for Nairobi households.",
    is_verified: true,
    location: { ...NAIVASI, area: "Westlands" },
    image_url: null,
    product_count: 3,
    region_label: "Nairobi",
    materials_preview: ["Glass", "Paper", "Cardboard"],
    reward_offerings: ["Recycled notebooks", "Glass aggregate", "Sorting kits"],
  },
  {
    id: "mock-mk-sokowatch",
    name: "SokoRecycle Crafts",
    slug: "sokorecycle-crafts",
    description:
      "Community workshop in Eastlands producing tote bags, planters, and homeware from post-consumer textiles and PET fabric.",
    is_verified: true,
    location: { ...NAIVASI, area: "Eastlands" },
    image_url: null,
    product_count: 3,
    region_label: "Nairobi",
    materials_preview: ["Textiles", "PET", "Plastic"],
    reward_offerings: ["Tote bags", "Planters", "Homeware"],
  },
  {
    id: "mock-mk-metalworks",
    name: "Nairobi Metalworks Co-op",
    slug: "nairobi-metalworks",
    description:
      "Scrap metal and aluminium recovery with rewards of recycled cookware, bike parts, and sheet metal offcuts for makers.",
    is_verified: true,
    location: { ...NAIVASI, area: "Industrial Area" },
    image_url: null,
    product_count: 2,
    region_label: "Nairobi",
    materials_preview: ["Metal", "Aluminium", "Steel"],
    reward_offerings: ["Recycled cookware", "Sheet offcuts"],
  },
  {
    id: "mock-mk-kilimani",
    name: "Kilimani Circular Pantry",
    slug: "kilimani-circular-pantry",
    description:
      "Neighbourhood refill and rewards hub — redeem tokens for bulk staples packaged in returnable glass and recycled paper.",
    is_verified: true,
    location: { ...NAIVASI, area: "Kilimani" },
    image_url: null,
    product_count: 2,
    region_label: "Nairobi",
    materials_preview: ["Glass", "Paper", "Plastic"],
    reward_offerings: ["Refill bundles", "Returnable jars"],
  },
  {
    id: "mock-mk-ruiru",
    name: "Ruiru E-Waste Point",
    slug: "ruiru-ewaste",
    description:
      "Electronics take-back with refurbished accessories and responsibly recovered component metals from Kiambu county.",
    is_verified: false,
    location: { country: "Kenya", city: "Kiambu", area: "Ruiru", formatted_address: "Ruiru, Kiambu, Kenya" },
    image_url: null,
    product_count: 2,
    region_label: "Kiambu",
    materials_preview: ["Electronics", "Metal", "Plastic"],
    reward_offerings: ["Refurb accessories", "Component metals"],
  },
];

const CATALOGUES: Record<string, RewardListItem[]> = {
  "ecopost-kenya": [
    reward("mock-r-ecopost-1", "mock-mk-ecopost", "Recycled fence post (2.4 m)", "HDPE post from verified Nairobi plastic intake.", ["HDPE"], "850", 120),
    reward("mock-r-ecopost-2", "mock-mk-ecopost", "Garden edging strip (5 m)", "Flexible edging for raised beds and paths.", ["Mixed plastics"], "420", 65),
    reward("mock-r-ecopost-3", "mock-mk-ecopost", "Deck board sample pack", "Three sample boards for architects and builders.", ["HDPE"], "1200", 180),
  ],
  "greencycle-westlands": [
    reward("mock-r-gc-1", "mock-mk-greencycle", "Recycled notebook (A5, 80 pp)", "Paper from office recovery streams.", ["Paper"], "280", 40),
    reward("mock-r-gc-2", "mock-mk-greencycle", "Glass aggregate (5 kg)", "Crushed glass for landscaping and concrete fill.", ["Glass"], "350", 50),
    reward("mock-r-gc-3", "mock-mk-greencycle", "Household sorting kit", "Three-bin starter kit with guide booklet.", ["Plastic", "Paper", "Glass"], "650", 90),
  ],
  "sokorecycle-crafts": [
    reward("mock-r-soko-1", "mock-mk-sokowatch", "Woven market tote", "PET fabric tote from Eastlands workshop.", ["Textiles", "PET"], "550", 75),
    reward("mock-r-soko-2", "mock-mk-sokowatch", "Recycled planter (medium)", "Planter from mixed post-consumer plastic.", ["Plastic"], "480", 70),
    reward("mock-r-soko-3", "mock-mk-sokowatch", "Homeware set (2 pcs)", "Bowl and tray set from recovered materials.", ["Textiles", "Plastic"], "720", 100),
  ],
  "nairobi-metalworks": [
    reward("mock-r-nmw-1", "mock-mk-metalworks", "Recycled cookware set", "Cast from recovered aluminium scrap.", ["Aluminium"], "1800", 240),
    reward("mock-r-nmw-2", "mock-mk-metalworks", "Maker sheet offcut bundle", "Assorted steel offcuts for small projects.", ["Steel"], "900", 130),
  ],
  "kilimani-circular-pantry": [
    reward("mock-r-kcp-1", "mock-mk-kilimani", "Refill bundle (grains + pulses)", "Staples in returnable glass jars.", ["Glass"], "1100", 150),
    reward("mock-r-kcp-2", "mock-mk-kilimani", "Returnable jar set (3)", "Deposit jars for pantry refills.", ["Glass"], "400", 55),
  ],
  "ruiru-ewaste": [
    reward("mock-r-re-1", "mock-mk-ruiru", "Refurb USB-C hub", "Tested accessory from responsible e-waste recovery.", ["Electronics"], "2200", 300),
    reward("mock-r-re-2", "mock-mk-ruiru", "Recovered copper ingot (demo)", "Educational sample from component recovery.", ["Metal"], "1500", 200),
  ],
};

export function getMockPartnerCatalogue(slug: string): CompanyCatalogueResponse | null {
  const company = MARKETPLACE_MOCK_PARTNERS.find((p) => p.slug === slug);
  if (!company) return null;
  const items = CATALOGUES[slug] ?? [];
  return {
    company,
    products: { items, limit: 64, offset: 0, count: items.length },
  };
}

export function getMockPartnerBySlug(slug: string): CompanyProductSummary | undefined {
  return MARKETPLACE_MOCK_PARTNERS.find((p) => p.slug === slug);
}

/** Resolve a mock reward detail by product id from seeded catalogue items. */
export function getMockProductReward(productId: string): import("@/types").ProductRewardDetail | null {
  for (const [slug, items] of Object.entries(CATALOGUES)) {
    const item = items.find((r) => r.id === productId);
    if (!item) continue;
    const company = getMockPartnerBySlug(slug);
    if (!company) continue;
    return {
      id: item.id,
      company_id: company.id,
      company_name: company.name,
      company_slug: company.slug,
      title: item.title,
      short_description: item.short_description,
      description: item.short_description,
      material_story: `Made from verified ${String(item.materials_used?.[0] ?? "recycled")} collected in ${company.location.city ?? "Nairobi"}.`,
      materials_used: item.materials_used,
      product_story: null,
      image_url: null,
      price_kes: item.price_kes,
      token_requirement: item.token_requirement,
      token_discount_value: null,
      is_redeemable: item.is_redeemable,
      is_discountable: item.is_discountable,
      availability: null,
      is_published: true,
      user_token_balance: null,
      reward_context: null,
    };
  }
  return null;
}
