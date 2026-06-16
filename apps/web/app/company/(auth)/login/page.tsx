import type { Metadata } from "next";
import { Suspense } from "react";

import { CompanySignInForm } from "@/app/auth/company/sign-in-form";

export const metadata: Metadata = {
  title: "Company sign in — tareka.",
  description: "Secure operational access for verified partner organisations.",
};

export default function CompanyLoginCanonicalPage() {
  return (
    <Suspense fallback={<div className="dark min-h-screen bg-background" />}>
      <CompanySignInForm />
    </Suspense>
  );
}
