"use client";

import { useEffect, useId, useRef, useState } from "react";

import { useI18n } from "@/lib/i18n/i18n-provider";
import { SUPPORTED_LOCALES } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn("h-3.5 w-3.5 shrink-0 opacity-60 transition-transform", open && "rotate-180")}
      aria-hidden
    >
      <path d="M4 6l4 5 4-5" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LanguageSwitcher({
  className,
  variant = "marketing",
}: {
  className?: string;
  /** marketing = dark chrome nav; app = light dashboard shell — menu stays graphite in both */
  variant?: "marketing" | "app";
}) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    function closeIfOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", closeIfOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", closeIfOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const triggerClass =
    variant === "marketing"
      ? cn(
          "rounded-lg border border-white/[0.10] bg-[#171718] text-[#EEEEE9]",
          "hover:border-white/[0.16] hover:bg-[#1C1C1B]",
          "focus-visible:border-white/[0.22] focus-visible:ring-2 focus-visible:ring-white/[0.12] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1011]",
        )
      : cn(
          "rounded-lg border border-[var(--border-subtle)] bg-[var(--elevated)] text-[var(--text-primary)] shadow-sm",
          "hover:bg-[var(--surface-raised)] hover:border-[var(--border-subtle)]",
          "focus-visible:ring-2 focus-visible:ring-accent-sage/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--canvas)]",
        );

  return (
    <div ref={wrapRef} className={cn("relative inline-flex min-h-9 items-center", className)}>
      <span className="sr-only">{t("language.label")}</span>
      <button
        type="button"
        aria-label={t("language.label")}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex min-h-9 min-w-[7.5rem] w-full cursor-pointer items-center justify-between gap-2 px-3 py-1.5 text-left text-xs font-medium outline-none transition-colors disabled:opacity-45",
          triggerClass,
          open &&
            variant === "marketing" &&
            "border-[rgba(161,201,152,0.38)] shadow-[inset_0_0_0_1px_rgba(161,201,152,0.08)]",
          open && variant === "app" && "border-accent-sage/35",
        )}
      >
        <span>{locale === "en" ? t("language.english") : t("language.swahili")}</span>
        <Chevron open={open} />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={t("language.label")}
          className={cn(
            "absolute left-0 top-[calc(100%+6px)] z-[100]",
            "min-w-full overflow-hidden rounded-lg border border-white/[0.10] bg-[#0F1011]",
            "py-1 shadow-[0_12px_40px_rgba(0,0,0,0.45)]",
          )}
        >
          {SUPPORTED_LOCALES.map((code) => {
            const selected = code === locale;
            return (
              <li key={code} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    if (!selected) setLocale(code);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center px-3 py-2 text-left text-xs font-medium outline-none transition-colors",
                    selected
                      ? "cursor-default bg-[#1e2420] text-[#cfe5d9] shadow-[inset_0_0_0_1px_rgba(161,201,152,0.28)]"
                      : "cursor-pointer text-[#E8EAE4] hover:bg-[#1C1C1C] hover:text-[#FAFAF7] focus-visible:bg-[#1a1f1f] focus-visible:text-[#FAFAF7]",
                  )}
                >
                  {code === "en" ? t("language.english") : t("language.swahili")}
                  {selected ? (
                    <span className="ml-auto pl-3 text-accent-sage" aria-hidden>
                      ✓
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
