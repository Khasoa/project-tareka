import { apiClient } from "@/lib/api";
import type { WalletDetail } from "@/types";

export const walletService = {
  async getById(walletId: string): Promise<WalletDetail> {
    const response = await apiClient.get<WalletDetail>(`/wallet/${walletId}`);
    return response.data;
  },
};
