export function StatsCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-hzwhite p-4">
      <div className="font-montserrat text-[10px] font-bold uppercase tracking-wide text-muted">{title}</div>
      <div className="mt-2 font-montserrat text-2xl font-extrabold text-charcoal">{value}</div>
    </div>
  );
}
