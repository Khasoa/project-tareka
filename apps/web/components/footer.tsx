import Link from "next/link";

import { Logo } from "./logo";

const link = "text-sm text-dim/70 transition-colors hover:text-foreground";
const colHead = "mb-5 text-[10px] font-medium uppercase tracking-[0.16em] text-dim/50";

export function MarketingFooter() {
  return (
    <footer className="bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo className="text-xl" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-dim/60">
              Infrastructure for verified recycling in Kenya.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className={colHead}>Product</p>
            <ul className="space-y-3">
              <li><Link href="/directory" className={link}>Directory</Link></li>
              <li><Link href="/dashboard" className={link}>Dashboard</Link></li>
              <li><Link href="/companies" className={link}>Business console</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className={colHead}>Company</p>
            <ul className="space-y-3">
              <li><Link href="/" className={link}>Our story</Link></li>
              <li><Link href="/" className={link}>Help centre</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className={colHead}>Legal</p>
            <ul className="space-y-3">
              <li><span className="text-sm text-dim/30">Privacy</span></li>
              <li><span className="text-sm text-dim/30">Terms</span></li>
            </ul>
          </div>

        </div>
      </div>

      <div className="border-t border-border/30 px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <p className="text-xs text-dim/40">© {new Date().getFullYear()} tareka</p>
          <p className="text-xs text-dim/30">Nairobi, Kenya</p>
        </div>
      </div>
    </footer>
  );
}
