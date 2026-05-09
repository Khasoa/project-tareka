import type { Metadata } from "next";

import { CompanyRequestAccessForm } from "../request-form";

export const metadata: Metadata = {
  title: "Request company access — tareka.",
  description: "Request verified partner access for your organisation.",
};

export default function CompanyRequestAccessPage() {
  return <CompanyRequestAccessForm />;
}
