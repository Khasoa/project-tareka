import type { UserRole } from "@/types";

/** Canonical settings URL per signed-in role. */
export function settingsPathForRole(role: UserRole): string {
  switch (role) {
    case "recycler":
    case "operator":
      return "/settings";
    case "company_admin":
      return "/company/settings";
    case "platform_admin":
      return "/admin/settings";
    default:
      return "/settings";
  }
}
