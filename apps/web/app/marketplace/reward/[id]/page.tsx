"use client";

import { PublicShell } from "@/components/layout/public-shell";

import { RewardDetailView } from "../../_components/reward-detail-view";

export default function MarketplaceRewardPage() {
  return (
    <PublicShell>
      <div className="relative px-4 py-6 sm:px-6 sm:py-10">
        <RewardDetailView />
      </div>
    </PublicShell>
  );
}
