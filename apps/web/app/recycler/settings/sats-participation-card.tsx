"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/card";
import { queryKeys } from "@/lib/query-keys";
import {
  getSatsPreferences,
  getSatsSummary,
  putSatsPreferences,
} from "@/services/sats-reward-channel.service";
import type { RecyclerSatsPayoutPreferences } from "@/types";

function railLabel(rail: string | null): string {
  switch (rail) {
    case "kotani_compatible":
      return "Kotani-compatible batch";
    case "lightning_batch":
      return "Lightning batch";
    case "low_connectivity_batch":
      return "Deferred / offline batch";
    case "manual_reconciliation":
      return "Manual reconciliation";
    default:
      return "Standard queue";
  }
}

export function SatsParticipationCard() {
  const queryClient = useQueryClient();
  const prefsQuery = useQuery({
    queryKey: queryKeys.satsPreferences,
    queryFn: getSatsPreferences,
  });
  const summaryQuery = useQuery({
    queryKey: queryKeys.satsSummary,
    queryFn: getSatsSummary,
  });

  const [la, setLa] = useState("");
  const [batch, setBatch] = useState(false);

  useEffect(() => {
    if (prefsQuery.data) {
      setLa(prefsQuery.data.lightning_address_placeholder ?? "");
      setBatch(prefsQuery.data.low_connectivity_opt_in);
    }
  }, [prefsQuery.data]);

  const saveMut = useMutation({
    mutationFn: (payload: RecyclerSatsPayoutPreferences) => putSatsPreferences(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.satsPreferences });
    },
  });

  const loading = prefsQuery.isLoading || prefsQuery.isFetching || summaryQuery.isLoading || summaryQuery.isFetching;
  const loadErr = prefsQuery.error || summaryQuery.error;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Optional sats participation</CardTitle>
        <CardDescription>
          Quiet infrastructure for Lightning-compatible participation incentives—not a wallet or exchange. Partners run
          their own payout compliance when sats are enabled.
        </CardDescription>
      </CardHeader>

      {loadErr ? <p className="text-sm text-accent-rose">Could not load sats preference data.</p> : null}

      {summaryQuery.data ? (
        <div className="mb-6 grid gap-3 rounded-xl border border-border bg-canvas px-4 py-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-dim">Pending</p>
            <p className="mt-1 font-heading text-lg font-semibold tabular-nums text-foreground">
              {summaryQuery.data.pending_total_sats} <span className="text-xs font-normal text-dim">sats</span>
            </p>
            <p className="mt-1 text-[11px] text-dim">{summaryQuery.data.pending_count} rows queued</p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-dim">Settled</p>
            <p className="mt-1 font-heading text-lg font-semibold tabular-nums text-foreground">
              {summaryQuery.data.sent_total_sats} <span className="text-xs font-normal text-dim">sats</span>
            </p>
            <p className="mt-1 text-[11px] text-dim">Acknowledged outbound</p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-dim">Needs attention</p>
            <p className="mt-1 font-heading text-lg font-semibold tabular-nums text-accent-rose">
              {summaryQuery.data.failed_total_sats} <span className="text-xs font-normal text-dim">sats</span>
            </p>
            <p className="mt-1 text-[11px] text-dim">Partner follow-up</p>
          </div>
        </div>
      ) : null}

      <p className="mb-4 text-xs leading-relaxed text-muted">
        {summaryQuery.data?.framing_note ??
          "Bitcoin sats are optional participation incentives from verified partners—not trading balances."}
      </p>

      {summaryQuery.data?.recent_activity.length ? (
        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-dim">Recent activity</p>
          <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
            {summaryQuery.data.recent_activity.slice(0, 5).map((row) => (
              <li key={row.id} className="gap-2 px-3 py-2.5 text-xs sm:flex sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {row.company_name ?? `Partner · ${row.company_id.slice(0, 8)}…`}
                  </p>
                  <p className="mt-0.5 text-[10px] text-dim">
                    <span className="text-accent-sage">{railLabel(row.payout_rail)}</span>
                    {" · "}
                    {new Date(row.created_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                    {" · "}
                    <span className="uppercase tracking-[0.08em]">{row.status}</span>
                  </p>
                </div>
                <p className="mt-2 shrink-0 tabular-nums text-foreground sm:mt-0">{row.sats_amount} sats</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <fieldset className="space-y-4 border-0 p-0" disabled={loading || Boolean(loadErr)}>
        <legend className="sr-only">Payout placeholders</legend>
        <div>
          <label htmlFor="ln-addr-ph" className="text-[11px] font-medium uppercase tracking-[0.1em] text-dim">
            Lightning destination (placeholder)
          </label>
          <input
            id="ln-addr-ph"
            value={la}
            onChange={(e) => setLa(e.target.value)}
            placeholder="Lightning address or LNURL alias — for future batch routing"
            className="mt-2 h-11 w-full rounded-lg border border-border bg-canvas px-3 text-sm text-foreground outline-none ring-accent-sage placeholder:text-dim focus:ring-2"
            autoComplete="off"
            maxLength={120}
          />
          <p className="mt-2 text-[11px] leading-relaxed text-dim">
            Informational only until a partner connects settlement. tareka does not custody funds or operate an exchange.
          </p>
        </div>
        <label className="flex min-h-[44px] cursor-pointer items-start gap-3 text-sm leading-snug">
          <input
            type="checkbox"
            checked={batch}
            onChange={(e) => setBatch(e.target.checked)}
            className="mt-1 accent-accent-sage"
          />
          <span className="text-muted">
            Open to deferred payouts via batch rails when connectivity is limited.
          </span>
        </label>

        <button
          type="button"
          onClick={() =>
            saveMut.mutate({
              lightning_address_placeholder: la.trim() || null,
              low_connectivity_opt_in: batch,
            })
          }
          disabled={saveMut.isPending || loading || Boolean(loadErr)}
          className="inline-flex min-h-[44px] items-center rounded-lg bg-accent-sage px-4 text-xs font-semibold text-[#161615] transition-colors hover:bg-accent-sage-hover disabled:opacity-50"
        >
          {saveMut.isPending ? "Saving…" : "Save placeholders"}
        </button>
      </fieldset>

      {saveMut.isError ? (
        <p className="mt-4 text-xs text-accent-rose">Unable to save — check your session and try again.</p>
      ) : saveMut.isSuccess ? (
        <p className="mt-4 text-xs text-accent-sage">Placeholder preferences saved on your profile.</p>
      ) : null}
    </Card>
  );
}
