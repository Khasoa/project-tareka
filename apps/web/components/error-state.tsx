"use client";

import { Button } from "./button";

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface px-6 py-8 text-center">
      <p className="font-heading text-lg font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-sm text-muted">{message}</p>
      {onRetry ? (
        <div className="mt-4">
          <Button type="button" variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : null}
    </div>
  );
}
