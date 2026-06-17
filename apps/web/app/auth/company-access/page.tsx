import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Company access — tareka.",
  description: "Secure operational access for verified partner organisations.",
};

/** Legacy URL — canonical company auth is `/company/login`. */
export default function LegacyCompanyAccessPage() {
  redirect("/company/login");
}
