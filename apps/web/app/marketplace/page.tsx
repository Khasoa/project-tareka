import type { Metadata } from "next";

import { PublicShell } from "@/components/layout/public-shell";

import { CatalogueBrowser } from "./_components/catalogue-browser";
import { RedemptionRail } from "./_components/redemption-rail";

export const metadata: Metadata = {
  title: "Partner marketplace — tareka.",
  description:
    "Browse participating recyclers and partners, open catalogues with published rewards — tokens, discounts, and community incentives.",
};

export default function MarketplacePage() {
  return (
    <PublicShell>
      <div className="relative">
        <div
          className="pointer-events-none fixed inset-x-0 top-[3.25rem] h-48 opacity-[0.22]"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 90% 60% at 50% -20%, rgba(143,178,174,0.14) 0%, transparent 60%)",
          }}
        />
        <div className="relative px-4 py-6 sm:px-6 sm:py-10">
          <RedemptionRail />
          <CatalogueBrowser />
        </div>
      </div>
    </PublicShell>
  );
}
