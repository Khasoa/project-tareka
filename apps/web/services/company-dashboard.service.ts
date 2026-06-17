import { apiClient } from "@/lib/api";
import type { CompanyDashboardSummary } from "@/types";

export const companyDashboardService = {
  async getSummary(companyId: string): Promise<CompanyDashboardSummary> {
    const response = await apiClient.get<CompanyDashboardSummary>(`/company-dashboard/${companyId}`);
    return response.data;
  },
};
