import clsx from 'clsx';
import { STAGE_BADGE_CLASS } from './crmConstants';

export function StageBadge({ stage }: { stage: string }) {
  const cls = STAGE_BADGE_CLASS[stage] ?? 's-notint';
  const label = stage.replace(/_/g, ' ');
  return (
    <span className={clsx('rounded-md px-2 py-0.5 font-montserrat text-[9.5px] font-bold uppercase tracking-wide', cls)}>
      {label}
    </span>
  );
}
