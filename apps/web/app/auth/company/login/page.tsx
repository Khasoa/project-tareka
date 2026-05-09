import type { Metadata } from "next";
import { Suspense } from "react";

import { CompanySignInForm } from "../sign-in-form";

export const metadata: Metadata = {
  title: "Company sign in — tareka.",
  description: "Secure operational access for verified partner organisations.",
};

export default function CompanyLoginPage() {
  return (
    <Suspense fallback={<div className="dark min-h-screen bg-[#161615]" />}>
      <CompanySignInForm />
    </Suspense>
  );
}
