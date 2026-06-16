"use client";

import { SiteDropoffsPanel } from "@/app/operator/_components/site-dropoffs-panel";
import { DashboardAnchor } from "@/components/dashboard-anchor";
import { useI18n } from "@/lib/i18n/i18n-provider";

export default function OperatorVerificationsPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <DashboardAnchor />
      <SiteDropoffsPanel
        title={t("operator.verifications.title")}
        description={t("operator.verifications.subtitle")}
        recentHours={48}
      />
    </div>
  );
}
