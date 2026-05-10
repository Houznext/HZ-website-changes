import { clsx } from 'clsx';
import type { ReactNode } from 'react';

const styles = {
  blue: 'bg-hz-blue-light text-blue-900',
  teal: 'bg-teal-100 text-teal-900',
  amber: 'bg-amber-100 text-amber-900',
  muted: 'bg-offwhite text-muted border border-border',
};

type Tone = keyof typeof styles;

export function Badge({ tone = 'blue', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide font-montserrat',
        styles[tone],
      )}
    >
      {children}
    </span>
  );
}
