import { apiClient } from "@/lib/api";
import type { RecyclerSearchHit, SiteRewardContext } from "@/types";

export interface OperatorSite {
  id: string;
  name: string;
  city: string;
  address: string;
  company_id: string;
}

export const operatorService = {
  async listSites(): Promise<OperatorSite[]> {
    const response = await apiClient.get<OperatorSite[]>("/operators/sites");
    return response.data;
  },

  async searchRecyclers(q: string): Promise<RecyclerSearchHit[]> {
    const response = await apiClient.get<RecyclerSearchHit[]>("/operators/recyclers/search", {
      params: { q, limit: 12 },
    });
    return response.data;
  },

  async siteRewardContext(siteId: string): Promise<SiteRewardContext> {
    const response = await apiClient.get<SiteRewardContext>(
      `/operators/sites/${siteId}/reward-context`,
    );
    return response.data;
  },
};
