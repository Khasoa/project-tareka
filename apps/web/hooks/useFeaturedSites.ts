"use client";

import { useQuery } from "@tanstack/react-query";

import { SiteCardCompact } from "@/components/site-card";
import { featuredMockSites } from "@/lib/data/directory-mock";
import { companyService } from "@/services/company.service";
import type { CompanyListItem } from "@/types";

const FEATURED_QUERY_KEY = ["sites", "featured", "Nairobi"] as const;

/**
 * Fetches a small set of verified collection sites in Nairobi
 * for display in the landing page network preview.
 * Falls back to Nairobi mock listings when the API is unavailable.
 */
export function useFeaturedSites(limit = 2) {
  return useQuery({
    queryKey: FEATURED_QUERY_KEY,
    queryFn: async (): Promise<CompanyListItem[]> => {
      try {
        const sites = await companyService.list({ country: "Kenya", city: "Nairobi" });
        if (sites.length > 0) return sites.slice(0, limit);
      } catch {
        /* demo fallback below */
      }
      return featuredMockSites(limit);
    },
    staleTime: 60_000,
    placeholderData: featuredMockSites(limit),
  });
}
