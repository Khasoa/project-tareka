import type { ReactNode } from "react";

import { MarketingFooter } from "@/components/footer";
import { Navbar } from "@/components/navbar";

// Public marketing pages (landing, for-companies, directory) always render
// on the dark theme — explicit .dark wrapper so CSS vars resolve correctly
// now that :root defaults to light mode.
export function PublicShell({
  children,
  marketingAudience = "general",
}: {
  children: ReactNode;
  /** Use `"companies"` on `/for-companies` — recycler sign-up CTAs are hidden. */
  marketingAudience?: "general" | "companies";
}) {
  return (
    <div className="dark relative min-h-screen bg-background text-foreground">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          background: [
            "radial-gradient(ellipse 80% 55% at 50% -8%, rgba(255,255,255,0.045) 0%, transparent 58%)",
            "radial-gradient(ellipse 55% 40% at 100% 30%, rgba(255,255,255,0.025) 0%, transparent 52%)",
            "radial-gradient(ellipse 50% 45% at 0% 85%, rgba(255,255,255,0.02) 0%, transparent 50%)",
          ].join(", "),
        }}
      />
      <div className="relative">
        <Navbar variant="marketing" marketingAudience={marketingAudience} />
        <main>{children}</main>
        <MarketingFooter />
      </div>
    </div>
  );
}
