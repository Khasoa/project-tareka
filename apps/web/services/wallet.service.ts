import { apiClient } from "@/lib/api";
import type { WalletDetail } from "@/types";

export interface WalletCompanyProgram {
  linked: boolean;
  wallet_id: string | null;
  token_balance: string | null;
}

export const walletService = {
  async getMyWalletForCompany(companyId: string): Promise<WalletCompanyProgram> {
    const response = await apiClient.get<WalletCompanyProgram>(
      `/wallet/me/for-company/${encodeURIComponent(companyId)}`,
    );
    return response.data;
  },

  async getById(walletId: string): Promise<WalletDetail> {
    const response = await apiClient.get<WalletDetail>(`/wallet/${walletId}`);
    return response.data;
  },
};
