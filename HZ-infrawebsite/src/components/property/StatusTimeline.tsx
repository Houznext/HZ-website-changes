import { clsx } from 'clsx';
import type { InfraProjectMilestone } from '@/types/infra.types';

export function StatusTimeline({ milestones }: { milestones: InfraProjectMilestone[] }) {
  return (
    <div className="space-y-4">
      {milestones.map((m, i) => (
        <div key={m.milestoneId} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={clsx(
                'h-3 w-3 rounded-full border-2',
                m.isCompleted ? 'border-hz-teal bg-hz-teal' : m.isCurrent ? 'border-hz-blue bg-hz-blue' : 'border-border bg-hzwhite',
              )}
            />
            {i < milestones.length - 1 && <div className="my-1 w-px flex-1 bg-border" />}
          </div>
          <div>
            <div className="font-montserrat text-sm font-bold text-charcoal">{m.label}</div>
            <div className="font-inter text-xs text-muted">{m.date}</div>
            {m.description && <p className="mt-1 font-inter text-xs text-charcoal/80">{m.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
