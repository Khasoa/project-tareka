import type { ReactNode } from "react";

import { MarketingFooter } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar variant="marketing" />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}
