import type { ReactNode } from "react";

import { AccountSettingsLayout } from "@/components/layout/account-settings-layout";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return <AccountSettingsLayout>{children}</AccountSettingsLayout>;
}
