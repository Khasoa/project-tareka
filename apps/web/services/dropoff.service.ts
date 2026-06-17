import { apiClient } from "@/lib/api";
import type {
  DropoffConfirmPayload,
  DropoffItem,
  PaginatedCompanyDropoffs,
  PaginatedDropoffs,
} from "@/types";

export const dropoffService = {
  async confirm(payload: DropoffConfirmPayload): Promise<DropoffItem> {
    const response = await apiClient.post<DropoffItem>("/dropoffs/confirm", payload);
    return response.data;
  },

  async listBySite(
    siteId: string,
    options: { limit?: number; offset?: number } = {},
  ): Promise<PaginatedDropoffs> {
    const { limit = 40, offset = 0 } = options;
    const response = await apiClient.get<PaginatedDropoffs>(`/dropoffs/site/${siteId}`, {
      params: { limit, offset },
    });
    return response.data;
  },

  async listByRecycler(
    recyclerId: string,
    options: { limit?: number; offset?: number } = {},
  ): Promise<PaginatedDropoffs> {
    const { limit = 20, offset = 0 } = options;
    const response = await apiClient.get<PaginatedDropoffs>(
      `/dropoffs/recycler/${recyclerId}`,
      { params: { limit, offset } },
    );
    return response.data;
  },

  async listByCompany(
    companyId: string,
    options: { limit?: number; offset?: number } = {},
  ): Promise<PaginatedCompanyDropoffs> {
    const { limit = 40, offset = 0 } = options;
    const response = await apiClient.get<PaginatedCompanyDropoffs>(
      `/dropoffs/company/${companyId}`,
      { params: { limit, offset } },
    );
    return response.data;
  },
};
