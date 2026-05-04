import Link from "next/link";

import { Logo } from "./logo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:flex-row sm:justify-between sm:px-6">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted">
            Infrastructure for verified recycling in Kenya. Impact figures are modelled estimates
            unless stated otherwise.
          </p>
        </div>
        <div className="flex gap-10 text-sm">
          <div className="space-y-2">
            <p className="font-medium text-foreground">Product</p>
            <ul className="space-y-2 text-muted">
              <li>
                <Link href="/directory" className="hover:text-foreground">
                  Directory
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-foreground">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-foreground">Legal</p>
            <ul className="space-y-2 text-muted">
              <li>
                <span className="cursor-default">Privacy (coming soon)</span>
              </li>
              <li>
                <span className="cursor-default">Terms (coming soon)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} tareka. Built for Kenyan recyclers and collection partners.
      </div>
    </footer>
  );
}
