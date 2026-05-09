"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/button";
import { DashboardAnchor } from "@/components/dashboard-anchor";
import { useAuthStore } from "@/store/auth";

export default function OperatorQuickLogPage() {
  const user = useAuthStore((s) => s.user);
  const [material, setMaterial] = useState("plastic");
  const [items, setItems] = useState("1");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-0.5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-accent-sage">
            Operator
          </p>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">
            Quick intake log
          </h1>
          <p className="mt-0.5 text-sm text-dim">
            Log a verified drop-off at the door. Connects to API when wired.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-muted">
          {user?.fullName ?? "Operator"}
        </div>
      </header>

      <DashboardAnchor />

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2"
      >
        <label className="block text-sm">
          <span className="mb-1 block text-dim">Material</span>
          <select
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-canvas px-3 text-foreground outline-none ring-accent-sage focus:ring-2"
          >
            <option value="plastic">Plastic</option>
            <option value="glass">Glass</option>
            <option value="metal">Metal</option>
            <option value="paper">Paper</option>
            <option value="ewaste">E-waste</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-dim">Items (count)</span>
          <input
            inputMode="numeric"
            value={items}
            onChange={(e) => setItems(e.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-canvas px-3 text-foreground outline-none ring-accent-sage focus:ring-2"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 block text-dim">Note (optional)</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Batch or donor reference"
            className="h-11 w-full rounded-lg border border-border bg-canvas px-3 text-foreground outline-none ring-accent-sage focus:ring-2"
          />
        </label>
        <div className="sm:col-span-2">
          <Button type="submit" variant="primary" className="min-h-11 w-full sm:w-auto">
            Confirm on record
          </Button>
          {submitted && (
            <p className="mt-2 text-xs text-dim">
              Preview only — hook submit to your operator endpoint.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
