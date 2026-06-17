"use client";

import { useParams } from "next/navigation";

import { PublicShell } from "@/components/layout/public-shell";

import { CatalogueBrowser } from "../_components/catalogue-browser";

export default function PartnerMarketplacePage() {
  const params = useParams();
  const raw = params.partner;
  const slug = typeof raw === "string" ? decodeURIComponent(raw).trim() : "";

  return (
    <PublicShell>
      <div className="relative px-4 py-6 sm:px-6 sm:py-10">
        <CatalogueBrowser partnerSlug={slug || undefined} />
      </div>
    </PublicShell>
  );
}
