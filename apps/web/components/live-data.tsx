// ─────────────────────────────────────────────────────────────────────────────
// Live Data — three headline metrics.
//
// Rendered inside a sage (#A8BFA6) panel. All colors are hardcoded dark-on-sage
// to guarantee contrast independent of CSS variable cascade order.
//
// Display priority:
//   1. Real API data  (metrics prop provided)
//   2. Preview values (default — clearly labelled as demo data)
//   3. No-activity    (noActivity = true — authenticated, nothing recorded yet)
// ─────────────────────────────────────────────────────────────────────────────

interface Metric {
  value: string;
  label: string;
}

const PREVIEW_METRICS: Metric[] = [
  { value: "128",  label: "Verified drop-offs" },
  { value: "2.4t", label: "Est. CO₂ avoided"   },
  { value: "6",    label: "Active partners"     },
];

interface LiveDataProps {
  metrics?: Metric[];
  noActivity?: boolean;
}

export function LiveData({ metrics, noActivity }: LiveDataProps) {
  const display = noActivity
    ? PREVIEW_METRICS.map((m) => ({ ...m, value: "—" }))
    : (metrics ?? PREVIEW_METRICS);

  const isPreview = !metrics && !noActivity;

  return (
    <div className="px-6 py-8 sm:px-10 sm:py-10">
      <dl className="grid grid-cols-3 divide-x divide-[rgba(22,22,21,0.12)]">
        {display.map((m) => (
          <div key={m.label} className="flex flex-col items-center gap-2 px-4 text-center sm:px-8">
            <dd
              className="font-heading text-4xl font-bold tracking-[-0.03em] sm:text-5xl"
              style={{ color: "#151613" }}
            >
              {m.value}
            </dd>
            <dt
              className="text-[10px] font-medium uppercase tracking-[0.12em]"
              style={{ color: "#2A2C28" }}
            >
              {m.label}
            </dt>
          </div>
        ))}
      </dl>

      <p
        className="mt-7 text-center text-[11px] font-medium"
        style={{ color: "#5B6058" }}
      >
        {noActivity
          ? "No activity yet — drop-offs appear here after your first verified collection."
          : isPreview
            ? "Preview data — live figures update when connected."
            : "Live data · updated in real time."}
      </p>
    </div>
  );
}
