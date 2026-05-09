import { PublicShell } from "@/components/layout/public-shell";

import { LandingPageClient } from "./landing-page-client";

export default function HomePage() {
  return (
    <PublicShell>
      <LandingPageClient />
    </PublicShell>
  );
}
