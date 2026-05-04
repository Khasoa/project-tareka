import { apiClient } from "@/lib/api";
import type { User, UserResponseRaw } from "@/types";

export interface LoginPayload {
  email?: string;
  phone?: string;
  password: string;
}

function mapUser(raw: UserResponseRaw): User {
  return {
    id: raw.id,
    fullName: raw.full_name,
    email: raw.email ?? undefined,
    phone: raw.phone ?? undefined,
    role: raw.role as User["role"],
    language: raw.language,
    isActive: raw.is_active,
    isVerified: raw.is_verified,
  };
}

export const authService = {
  async login(payload: LoginPayload): Promise<User> {
    await apiClient.post("/auth/login", payload);
    const response = await apiClient.get<UserResponseRaw>("/auth/me");
    return mapUser(response.data);
  },
  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },
  async currentUser(): Promise<User> {
    const response = await apiClient.get<UserResponseRaw>("/auth/me");
    return mapUser(response.data);
  },
};
