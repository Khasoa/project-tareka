import { apiClient } from "@/lib/api";
import type { User, UserResponseRaw } from "@/types";

export interface LoginPayload {
  email?: string;
  phone?: string;
  password: string;
}

// Mirrors backend RegisterRequest schema (schemas/auth.py).
// At least one of email / phone must be provided.
export interface RegisterPayload {
  full_name: string;
  email?: string;
  phone?: string;
  password: string;
  language?: "en" | "sw";
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
    companyId: raw.company_id ?? null,
  };
}

export const authService = {
  // POST /auth/register — 201, no session/cookie.
  // Returns on success; caller should redirect to /auth/login.
  async register(payload: RegisterPayload): Promise<void> {
    await apiClient.post("/auth/register", payload);
  },

  async login(payload: LoginPayload): Promise<User> {
    // Step 1: authenticate — may throw 401 for bad credentials.
    await apiClient.post("/auth/login", payload);

    // Step 2: fetch session. The browser must send the HttpOnly cookie set
    // above.  This ONLY works when the API is on the same "site" as the
    // Next.js app (both on localhost:*).  If the cookie is missing the
    // request returns 401 here, not in step 1 — wrap it so callers can
    // distinguish a credential failure from a session-fetch failure.
    try {
      const response = await apiClient.get<UserResponseRaw>("/auth/me");
      return mapUser(response.data);
    } catch (err) {
      throw Object.assign(
        new Error("Login succeeded but session could not be loaded."),
        { isSessionError: true, cause: err },
      );
    }
  },
  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },
  async currentUser(): Promise<User> {
    const response = await apiClient.get<UserResponseRaw>("/auth/me");
    return mapUser(response.data);
  },
};
