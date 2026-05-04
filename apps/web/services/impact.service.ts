import { apiClient } from "@/lib/api";
import type { ImpactTotals } from "@/types";

export const impactService = {
  async getRecyclerImpact(recyclerId: string): Promise<ImpactTotals> {
    const response = await apiClient.get<ImpactTotals>(`/impact/recycler/${recyclerId}`);
    return response.data;
  },

  async getCompanyImpact(companyId: string): Promise<ImpactTotals> {
    const response = await apiClient.get<ImpactTotals>(`/impact/company/${companyId}`);
    return response.data;
  },
};
