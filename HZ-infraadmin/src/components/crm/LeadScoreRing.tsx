import clsx from 'clsx';

function scoreTier(s: number): string {
  if (s >= 80) return 'score-80';
  if (s >= 60) return 'score-60';
  if (s >= 40) return 'score-40';
  return 'score-low';
}

export function LeadScoreRing({ score, size = 34 }: { score: number; size?: number }) {
  const s = Math.max(0, Math.min(100, Math.round(score)));
  return (
    <div
      className={clsx('score-ring', scoreTier(s), size >= 48 && 'score-lg')}
      style={size >= 48 ? undefined : { width: size, height: size, fontSize: size < 30 ? 9 : 11 }}
      title={`Lead score ${s}`}
    >
      {s}
    </div>
  );
}
