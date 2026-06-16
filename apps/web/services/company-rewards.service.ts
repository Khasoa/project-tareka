import { apiClient } from "@/lib/api";
import type {
  CompanyMaterialRewardRule,
  CompanyRewardPreviewResult,
  CompanyRewardProgramme,
  CompanyRewardRedemptionSettings,
  CompanyRewardMode,
} from "@/types";

export type CompanyRewardProgrammePatch = {
  programme_enabled?: boolean;
  reward_mode?: CompanyRewardMode;
  material_rules?: Record<string, CompanyMaterialRewardRule | null>;
  redemption?: Partial<CompanyRewardRedemptionSettings>;
};

export const companyRewardsService = {
  async get(companyId: string): Promise<CompanyRewardProgramme> {
    const response = await apiClient.get<CompanyRewardProgramme>(`/company-rewards/${companyId}`);
    return response.data;
  },

  async update(companyId: string, patch: CompanyRewardProgrammePatch): Promise<CompanyRewardProgramme> {
    const response = await apiClient.put<CompanyRewardProgramme>(`/company-rewards/${companyId}`, patch);
    return response.data;
  },

  async preview(companyId: string, body: { material_type: string; weight_kg: number }) {
    const response = await apiClient.post<CompanyRewardPreviewResult>(
      `/company-rewards/${companyId}/preview`,
      body,
    );
    return response.data;
  },
};
