import axios from "axios";

import { type LoginPayload } from "@/services/auth.service";
import type { UserRole } from "@/types";

export function roleRoute(role: UserRole): string {
  switch (role) {
    case "company_admin":
      return "/company/dashboard";
    case "recycler":
      return "/recycler/dashboard";
    case "operator":
      return "/operator/quick-log";
    case "platform_admin":
      return "/admin";
    default:
      return "/company/dashboard";
  }
}

export function resolveLoginError(err: unknown): string {
  if (err && typeof err === "object" && "isSessionError" in err) {
    return "Signed in, but your session could not be loaded. Please try again.";
  }
  if (axios.isAxiosError(err)) {
    if (!err.response) return "Unable to connect. Please try again.";
    if (err.response.status === 401) return "Invalid email or password.";
    return (
      err.response.data?.error?.message ??
      err.response.data?.detail ??
      "Something went wrong. Please try again."
    );
  }
  return "Something went wrong. Please try again.";
}

export function resolveRequestError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) return "Unable to connect. Please try again.";
    const status = err.response.status;
    if (status === 429) return "Too many attempts. Please wait a moment and try again.";
    if (status === 422 || status === 400) {
      const detail = err.response.data?.error?.message ?? err.response.data?.detail;
      if (typeof detail === "string") return detail;
      return "Please check the information you provided.";
    }
    return (
      err.response.data?.error?.message ??
      err.response.data?.detail ??
      "We couldn't send your request. Please try again."
    );
  }
  return "We couldn't send your request. Please try again.";
}

export const INDUSTRIES = [
  "Waste Management",
  "Manufacturing",
  "Retail & FMCG",
  "Hospitality",
  "Healthcare",
  "Education",
  "Financial Services",
  "Real Estate",
  "Agriculture",
  "Other",
] as const;

export const companyInputCls =
  "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:opacity-35 focus:ring-1";

export const companyInputStyle = {
  background: "#232323",
  color: "#E6E8E3",
  border: "1px solid rgba(232,237,234,0.10)",
} as const;
