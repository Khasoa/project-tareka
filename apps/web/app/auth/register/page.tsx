import { Suspense } from "react";

import { RegisterForm } from "./register-form";

export const metadata = {
  title: "Create account — tareka.",
  description: "Create your tareka account and start tracking verified recycling contributions.",
};

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
