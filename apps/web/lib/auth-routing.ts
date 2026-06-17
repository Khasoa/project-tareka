import type { UserRole } from "@/types";

import { settingsPathForRole } from "./settings-routes";

/** Canonical home route after sign-in for each role. */
export function roleHomeRoute(role: UserRole): string {
  switch (role) {
    case "recycler":
      return "/dashboard";
    case "operator":
      return "/operator/quick-log";
    case "company_admin":
      return "/company/dashboard";
    case "platform_admin":
      return "/admin";
    default:
      return "/dashboard";
  }
}

/** Post-login destination honouring ?redirect= when safe. */
export function postLoginDestination(rawRedirect: string | null, role: UserRole): string {
  if (rawRedirect === "/settings") return settingsPathForRole(role);
  if (rawRedirect?.startsWith("/")) return rawRedirect;
  return roleHomeRoute(role);
}

/** Company portal sign-in fallback (company_admin / platform_admin first). */
export function companyPortalHomeRoute(role: UserRole): string {
  switch (role) {
    case "company_admin":
      return "/company/dashboard";
    case "platform_admin":
      return "/admin";
    case "recycler":
      return "/dashboard";
    case "operator":
      return "/operator/quick-log";
    default:
      return "/company/dashboard";
  }
}

export function signOutDestination(role: UserRole | undefined): string {
  return role === "company_admin" || role === "platform_admin" ? "/company/login" : "/auth/login";
}

export function loginRedirectUrl(destination: string): string {
  return `/auth/login?redirect=${encodeURIComponent(destination)}`;
}

export function companyLoginRedirectUrl(destination: string): string {
  return `/company/login?redirect=${encodeURIComponent(destination)}`;
}
