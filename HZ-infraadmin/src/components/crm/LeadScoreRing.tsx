import clsx from 'clsx';
import { scoreRingClass } from './crmConstants';

export function LeadScoreRing({ score, size = 34 }: { score: number; size?: number }) {
  const s = Math.max(0, Math.min(100, Math.round(score)));
  return (
    <div
      className={clsx('score-ring', scoreRingClass(s))}
      style={{ width: size, height: size, fontSize: size < 30 ? 9 : 11 }}
      title={`Lead score ${s}`}
    >
      {s}
    </div>
  );
}
