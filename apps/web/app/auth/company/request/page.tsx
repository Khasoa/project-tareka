import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Request company access — tareka.",
};

/** Legacy URL — canonical path is `/company/request-access`. */
export default function LegacyCompanyRequestRedirect() {
  redirect("/company/request-access");
}
