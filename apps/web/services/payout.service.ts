import { apiClient } from "@/lib/api";
import type { PayoutLedgerItem } from "@/types";

export const payoutService = {
  /**
   * `weekOf` — any date within the target ISO week (UTC), YYYY-MM-DD.
   */
  async getCompanyWeekly(companyId: string, weekOf: string): Promise<PayoutLedgerItem[]> {
    const response = await apiClient.get<PayoutLedgerItem[]>(
      `/payouts/company/${companyId}/weekly`,
      { params: { week_of: weekOf } },
    );
    return response.data;
  },
};
