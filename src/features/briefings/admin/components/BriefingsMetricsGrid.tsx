export function BriefingsMetricsGrid({
  items,
}: {
  items: Array<{ label: string; value: string | number; helper?: string }>;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">{item.label}</p>
          <p className="mt-2 text-3xl font-black text-white">{item.value}</p>
          {item.helper ? <p className="mt-2 text-xs text-white/45">{item.helper}</p> : null}
        </div>
      ))}
    </div>
  );
}
