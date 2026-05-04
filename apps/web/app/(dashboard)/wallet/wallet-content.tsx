"use client";

import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/card";
import { ErrorState } from "@/components/error-state";
import { queryKeys } from "@/lib/query-keys";
import { dropoffService } from "@/services/dropoff.service";
import { walletService } from "@/services/wallet.service";
import { useAuthStore } from "@/store/auth";

function parseDecimal(s: string | undefined) {
  if (!s) return 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

export function WalletContent() {
  const searchParams = useSearchParams();
  const walletId = searchParams.get("wallet") ?? "";
  const { user, fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    void fetchCurrentUser();
  }, [fetchCurrentUser]);

  const recyclerId = user?.role === "recycler" ? user.id : null;

  const dropoffsQuery = useQuery({
    queryKey: recyclerId ? queryKeys.recyclerDropoffs(recyclerId, 50, 0) : ["dropoffs", "skip"],
    queryFn: () => dropoffService.listByRecycler(recyclerId!, { limit: 50, offset: 0 }),
    enabled: Boolean(recyclerId),
  });

  const walletQuery = useQuery({
    queryKey: queryKeys.wallet(walletId),
    queryFn: () => walletService.getById(walletId),
    enabled: Boolean(walletId),
  });

  const summedTokens = useMemo(() => {
    if (!dropoffsQuery.data?.items.length) return 0;
    return dropoffsQuery.data.items.reduce(
      (acc, d) => acc + parseDecimal(d.reward_summary?.tokens),
      0,
    );
  }, [dropoffsQuery.data?.items]);

  if (!user) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <h1 className="font-heading text-2xl font-semibold">Wallet</h1>
        <p className="text-sm text-muted">
          Sign in to see appreciation token activity from your verified drop-offs. Balances are also
          available per organisation when you open a program wallet with that partner.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Wallet</h1>
        <p className="mt-2 text-sm text-muted">
          A calm record of appreciation tokens and obligations. Not a bank account, not a trading
          wallet.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appreciation tokens</CardTitle>
            <CardDescription>
              Tokens accrue per partner when they confirm your drop-offs. Scoped balances require the
              partner wallet id (API).
            </CardDescription>
          </CardHeader>
          {recyclerId && dropoffsQuery.isLoading ? (
            <div className="h-16 animate-pulse rounded bg-elevated" />
          ) : recyclerId && dropoffsQuery.isError ? (
            <ErrorState
              message={
                isAxiosError(dropoffsQuery.error)
                  ? String(
                      dropoffsQuery.error.response?.data?.error?.message ??
                        dropoffsQuery.error.message,
                    )
                  : "Could not load activity."
              }
              onRetry={() => void dropoffsQuery.refetch()}
            />
          ) : (
            <div>
              <p className="font-heading text-3xl font-semibold tabular-nums text-foreground">
                {walletId && walletQuery.data
                  ? Number(walletQuery.data.token_balance).toLocaleString()
                  : summedTokens > 0
                    ? summedTokens.toLocaleString(undefined, { maximumFractionDigits: 2 })
                    : "—"}
              </p>
              <p className="mt-2 text-xs text-muted">
                {walletId
                  ? "Loaded from your selected program wallet."
                  : "Recent confirmations (first page only) summed for a quick view. Add a wallet query parameter for an exact program balance."}
              </p>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending partner obligations</CardTitle>
            <CardDescription>
              Where KES appreciation is enabled, your company records the obligation and settles
              outside tareka. Check your weekly payout statement from the partner.
            </CardDescription>
          </CardHeader>
          <p className="text-sm text-muted">No items loaded in this view.</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">History</CardTitle>
          <CardDescription>Recent reward lines from verified drop-offs.</CardDescription>
        </CardHeader>
        {!recyclerId ? null : dropoffsQuery.isLoading ? (
          <div className="h-32 animate-pulse rounded bg-elevated" />
        ) : (
          <ul className="divide-y divide-border">
            {(dropoffsQuery.data?.items ?? []).map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span className="text-foreground">
                  {d.material_type.replace(/_/g, " ")} · {d.item_count} items
                </span>
                <span className="tabular-nums text-muted">
                  tokens {d.reward_summary ? parseDecimal(d.reward_summary.tokens).toFixed(2) : "—"}
                </span>
                <span className="w-full text-xs text-muted sm:w-auto">
                  {new Date(d.confirmed_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
