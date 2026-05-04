import { apiClient } from "@/lib/api";
import type { PaginatedDropoffs } from "@/types";

export const dropoffService = {
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
};
