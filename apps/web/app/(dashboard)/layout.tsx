import type { ReactNode } from "react";

import { RecyclerGuardLayout } from "@/components/layout/recycler-guard-layout";

export default function DashboardGroupLayout({ children }: { children: ReactNode }) {
  return <RecyclerGuardLayout>{children}</RecyclerGuardLayout>;
}
