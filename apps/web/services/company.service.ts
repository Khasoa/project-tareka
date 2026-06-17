import { apiClient } from "@/lib/api";
import type { CompanyDetail, CompanyListItem } from "@/types";

export interface ListCompaniesParams {
  country?: string;
  city?: string;
  nearLat?: number;
  nearLng?: number;
  radiusKm?: number;
}

export const companyService = {
  async list(params: ListCompaniesParams = {}): Promise<CompanyListItem[]> {
    const response = await apiClient.get<CompanyListItem[]>("/companies", {
      params: {
        country: params.country,
        city: params.city,
        near_lat: params.nearLat,
        near_lng: params.nearLng,
        radius_km: params.radiusKm ?? 10,
      },
    });
    return response.data;
  },

  async getById(id: string): Promise<CompanyDetail | null> {
    const response = await apiClient.get<CompanyDetail | { message: string }>(
      `/companies/${id}`,
    );
    if ("message" in response.data) {
      return null;
    }
    return response.data;
  },
};
