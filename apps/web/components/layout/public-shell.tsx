import type { ReactNode } from "react";

import { MarketingFooter } from "@/components/footer";
import { Navbar } from "@/components/navbar";

// Public marketing pages (landing, for-companies, directory) always render
// on the dark theme — explicit .dark wrapper so CSS vars resolve correctly
// now that :root defaults to light mode.
export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="dark relative min-h-screen bg-background text-foreground">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.28]"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% -15%, rgba(230,232,227,0.06) 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 100% 20%, rgba(20,21,20,0.30) 0%, transparent 50%)",
        }}
      />
      <div className="relative">
        <Navbar variant="marketing" />
        <main>{children}</main>
        <MarketingFooter />
      </div>
    </div>
  );
}
