import type { ReactNode } from "react";
import { cookies } from "next/headers";

import { ErrorState } from "@/components/error-state";
import { getApiBaseUrl } from "@/lib/api-base";

import { AdminShell } from "./admin-shell";

async function loadMe(cookieHeader: string | null): Promise<{ role: string } | null> {
  if (!cookieHeader) return null;
  const res = await fetch(`${getApiBaseUrl()}/auth/me`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json() as Promise<{ role: string }>;
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const cookieHeader = token ? `access_token=${token}` : null;
  const me = await loadMe(cookieHeader);

  if (!me) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="mx-auto max-w-md">
          <ErrorState
            title="Session required"
            message="Sign in with a platform administrator account to open network operations."
          />
        </div>
      </div>
    );
  }

  if (me.role !== "platform_admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="mx-auto max-w-md">
          <ErrorState
            title="Access restricted"
            message="This console is reserved for tareka platform administrators."
          />
        </div>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
