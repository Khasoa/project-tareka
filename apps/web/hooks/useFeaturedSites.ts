"use client";

import { useQuery } from "@tanstack/react-query";

import { SiteCardCompact } from "@/components/site-card";
import { featuredMockSites } from "@/lib/data/directory-mock";
import { withApiFallback } from "@/lib/data/api-fallback";
import { companyService } from "@/services/company.service";
import type { CompanyListItem } from "@/types";

const FEATURED_QUERY_KEY = ["sites", "featured", "Nairobi"] as const;

export function useFeaturedSites(limit = 2) {
  return useQuery({
    queryKey: FEATURED_QUERY_KEY,
    queryFn: () =>
      withApiFallback(
        "featured directory sites",
        async () => {
          const sites = await companyService.list({ country: "Kenya", city: "Nairobi" });
          return sites.slice(0, limit);
        },
        () => featuredMockSites(limit),
        (items) => items.length === 0,
      ),
    staleTime: 60_000,
    placeholderData: featuredMockSites(limit),
  });
}
