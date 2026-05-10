import type { InfraProperty } from '@/types/infra.types';
import { Button } from '@/components/ui/Button';

export function ApprovalsTable({
  data,
  onApprove,
}: {
  data: InfraProperty[];
  onApprove: (id: string) => void | Promise<void>;
}) {
  return (
    <div className="space-y-3">
      {data.map((p) => (
        <div
          key={p.propertyId}
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-hzwhite p-4"
        >
          <div className="font-montserrat font-bold text-charcoal">{p.title}</div>
          <Button variant="primary" onClick={() => void onApprove(p.propertyId)}>
            Approve
          </Button>
        </div>
      ))}
    </div>
  );
}
