import { apiClient } from "@/lib/api";
import type { ImpactTotals, NetworkImpactExperience } from "@/types";

export const impactService = {
  async getRecyclerImpact(recyclerId: string): Promise<ImpactTotals> {
    const response = await apiClient.get<ImpactTotals>(`/impact/recycler/${recyclerId}`);
    return response.data;
  },

  async getNetworkExperience(): Promise<NetworkImpactExperience> {
    const response = await apiClient.get<NetworkImpactExperience>("/impact/network");
    return response.data;
  },
};
