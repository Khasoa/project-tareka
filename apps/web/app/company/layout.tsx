import type { ReactNode } from "react";

/** Segment layout — auth routes `(auth)` omit the dashboard guard in `(dashboard)/layout.tsx`. */
export default function CompanySegmentLayout({ children }: { children: ReactNode }) {
  return children;
}
