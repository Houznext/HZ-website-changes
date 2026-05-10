export type SiteVisitRow = { visitId: string; name: string; phone: string; status: string };

export function SiteVisitsTable({ data }: { data: SiteVisitRow[] }) {
  return (
    <div className="space-y-2">
      {data.map((r) => (
        <div key={r.visitId} className="rounded-lg border border-border bg-hzwhite p-3 font-inter text-sm">
          <span className="font-montserrat font-bold">{r.name}</span> · {r.phone} ·{' '}
          <span className="text-muted">{r.status}</span>
        </div>
      ))}
    </div>
  );
}
