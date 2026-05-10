import { clsx } from 'clsx';
import type { ReactNode } from 'react';

const styles = {
  blue: 'bg-hz-blue-light text-hz-blue',
  teal: 'bg-teal-100 text-hz-teal',
  amber: 'bg-amber-100 text-hz-amber',
  muted: 'bg-offwhite text-muted border border-border',
};

type Tone = keyof typeof styles;

export function Badge({ tone = 'blue', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={clsx(
        'badge inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
        styles[tone],
      )}
    >
      {children}
    </span>
  );
}
