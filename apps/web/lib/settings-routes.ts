import type { UserRole } from "@/types";

/** Canonical settings URL per signed-in role (no legacy `/settings`). */
export function settingsPathForRole(role: UserRole): string {
  switch (role) {
    case "recycler":
      return "/recycler/settings";
    case "operator":
      return "/operator/settings";
    case "company_admin":
      return "/company/settings";
    case "platform_admin":
      return "/admin/settings";
    default:
      return "/recycler/settings";
  }
}
