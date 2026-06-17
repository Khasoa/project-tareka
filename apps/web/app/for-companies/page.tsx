import type { Metadata } from "next";

import { PublicShell } from "@/components/layout/public-shell";

import { ForCompaniesClient } from "./for-companies-client";

export const metadata: Metadata = {
  title: "For companies — tareka.",
  description:
    "tareka helps collection partners and recycling companies turn confirmed drop-offs into cleaner records for reporting, operations, and community recognition.",
};

export default function ForCompaniesPage() {
  return (
    <PublicShell marketingAudience="companies">
      <ForCompaniesClient />
    </PublicShell>
  );
}
