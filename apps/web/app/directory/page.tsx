import type { Metadata } from "next";

import { PublicShell } from "@/components/layout/public-shell";

import { DirectoryView } from "./directory-view";

export const metadata: Metadata = {
  title: "Collection directory — tareka.",
  description:
    "Browse verified collection sites and partner organisations in the tareka network.",
};

export default function DirectoryPage() {
  return (
    <PublicShell>
      <div className="px-4 py-8 sm:px-6 sm:py-12">
        <DirectoryView />
      </div>
    </PublicShell>
  );
}
