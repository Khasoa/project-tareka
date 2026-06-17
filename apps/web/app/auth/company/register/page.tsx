import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Company registration — tareka.",
  description: "Request verified partner access for your organisation.",
};

/** Company onboarding — alias to request-access flow */
export default function CompanyRegisterRedirectPage() {
  redirect("/company/request-access");
}
