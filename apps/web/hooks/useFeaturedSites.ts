import { useQuery } from "@tanstack/react-query";

import { companyService } from "@/services/company.service";

const FEATURED_QUERY_KEY = ["sites", "featured", "Nairobi"] as const;

/**
 * Fetches a small set of verified collection sites in Nairobi
 * for display in the landing page network preview.
 */
export function useFeaturedSites(limit = 2) {
  return useQuery({
    queryKey: FEATURED_QUERY_KEY,
    queryFn: () =>
      companyService.list({ country: "Kenya", city: "Nairobi" }).then((sites) =>
        sites.slice(0, limit),
      ),
    staleTime: 60_000,
  });
}
