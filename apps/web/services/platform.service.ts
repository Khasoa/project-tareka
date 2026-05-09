import { apiClient } from "@/lib/api";
import type { PlatformOperationsSnapshot } from "@/types";

export const platformService = {
  async getOperationsSnapshot(): Promise<PlatformOperationsSnapshot> {
    const response = await apiClient.get<PlatformOperationsSnapshot>("/platform/operations");
    return response.data;
  },
};
