export function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-dim">{label}</label>
      {children}
      {error ? <p className="text-xs" style={{ color: "#c48080" }}>{error}</p> : null}
    </div>
  );
}
