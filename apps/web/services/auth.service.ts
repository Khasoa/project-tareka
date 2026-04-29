import { apiClient } from "@/lib/api";
import type { User } from "@/types";

export interface LoginPayload {
  email?: string;
  phone?: string;
  password: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<User> {
    await apiClient.post("/v1/auth/login", payload);
    const response = await apiClient.get<User>("/v1/auth/me");
    return response.data;
  },
  async logout(): Promise<void> {
    await apiClient.post("/v1/auth/logout");
  },
  async currentUser(): Promise<User> {
    const response = await apiClient.get<User>("/v1/auth/me");
    return response.data;
  },
};
