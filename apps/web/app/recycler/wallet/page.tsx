import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Wallet — tareka" };

export default function WalletPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5 py-2">
      <div>
        <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.10em] text-accent-sage">
          Recognition
        </p>
        <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
          Wallet
        </h1>
        <p className="mt-0.5 text-sm text-dim">
          Recognition tokens and appreciation benefits from participating companies.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent-sage/10 text-accent-sage text-lg" aria-hidden>
          ★
        </div>
        <p className="font-heading text-sm font-semibold text-foreground">
          No recognition tokens yet
        </p>
        <p className="mx-auto mt-2 max-w-xs text-xs text-dim leading-relaxed">
          Recognition tokens appear here when participating companies enable appreciation
          programs. Complete verified drop-offs to qualify.
        </p>
        <Link
          href="/directory"
          className="mt-5 inline-flex h-8 items-center justify-center rounded-lg bg-accent-sage px-4 text-xs font-medium text-[#161615] transition-colors hover:bg-accent-sage-hover"
        >
          Find a collection site
        </Link>
      </div>
    </div>
  );
}
