import type { Metadata } from "next";

import { CompanyRequestAccessForm } from "@/app/auth/company/request-form";

export const metadata: Metadata = {
  title: "Request company access — tareka.",
  description: "Request verified partner access for your organisation.",
};

export default function CompanyRequestAccessCanonicalPage() {
  return <CompanyRequestAccessForm />;
}
