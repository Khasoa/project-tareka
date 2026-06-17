"use client";

import { SiteDropoffsPanel } from "@/app/operator/_components/site-dropoffs-panel";
import { DashboardAnchor } from "@/components/dashboard-anchor";
import { useI18n } from "@/lib/i18n/i18n-provider";

export default function OperatorQuickLogPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <DashboardAnchor />
      <SiteDropoffsPanel
        title={t("dashboard.nav.quickLog")}
        description="Confirm verified intake at your assigned collection site."
        recentHours={24}
      />
    </div>
  );
}
