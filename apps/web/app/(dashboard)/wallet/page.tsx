"use client";

import { Suspense } from "react";

import { WalletContent } from "./wallet-content";

function WalletFallback() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="h-8 w-48 animate-pulse rounded bg-elevated" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-40 animate-pulse rounded-lg border border-border bg-surface" />
        <div className="h-40 animate-pulse rounded-lg border border-border bg-surface" />
      </div>
    </div>
  );
}

export default function WalletPage() {
  return (
    <Suspense fallback={<WalletFallback />}>
      <WalletContent />
    </Suspense>
  );
}
