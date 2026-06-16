import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Company sign in — tareka.",
};

/** Legacy URL — canonical company auth is `/company/login`. */
export default function LegacyCompanyLoginRedirect() {
  redirect("/company/login");
}
