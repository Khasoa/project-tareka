import { apiClient } from "@/lib/api";
import type {
  CompanyCatalogueResponse,
  MarketplaceFeedResponse,
  ProductRewardDetail,
  ProductRedeemResponse,
  RedemptionHistoryResponse,
  PaginatedResponse,
  CompanyProductSummary,
} from "@/types";

export async function getMarketplaceFeed(params: {
  limit?: number;
  offset?: number;
  partner?: string;
}): Promise<MarketplaceFeedResponse> {
  const { data } = await apiClient.get<MarketplaceFeedResponse>("/products/marketplace", {
    params: {
      limit: params.limit ?? 24,
      offset: params.offset ?? 0,
      partner: params.partner || undefined,
    },
  });
  return data;
}

export async function getPartnerCatalogueBySlug(slug: string, params?: { limit?: number; offset?: number }) {
  const { data } = await apiClient.get<CompanyCatalogueResponse>(
    `/products/company/by-slug/${encodeURIComponent(slug)}`,
    { params: { limit: params?.limit ?? 48, offset: params?.offset ?? 0 } },
  );
  return data;
}

export async function listParticipatingProductCompanies(params?: {
  limit?: number;
  offset?: number;
}): Promise<PaginatedResponse<CompanyProductSummary>> {
  const { data } = await apiClient.get<PaginatedResponse<CompanyProductSummary>>(
    "/products/companies",
    { params: { limit: params?.limit ?? 100, offset: params?.offset ?? 0 } },
  );
  return data;
}

export async function getProductReward(productId: string): Promise<ProductRewardDetail> {
  const { data } = await apiClient.get<ProductRewardDetail>(`/products/${encodeURIComponent(productId)}`);
  return data;
}

export async function redeemProduct(productId: string): Promise<ProductRedeemResponse> {
  const { data } = await apiClient.post<ProductRedeemResponse>(
    `/products/${encodeURIComponent(productId)}/redeem`,
  );
  return data;
}

export async function getMyRedemptions(params?: { limit?: number; offset?: number }) {
  const { data } = await apiClient.get<RedemptionHistoryResponse>("/products/redemptions/me", {
    params: { limit: params?.limit ?? 30, offset: params?.offset ?? 0 },
  });
  return data;
}
