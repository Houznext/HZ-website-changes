type Props = {
  pct: number;
  color?: string;
  height?: number;
  className?: string;
};

export default function ProgressBar({
  pct,
  color = 'var(--blue)',
  height = 6,
  className = '',
}: Props) {
  const w = Math.min(100, Math.max(0, pct));
  return (
    <div className={`lb-prog-bar ${className}`.trim()} style={{ height }}>
      <div
        className="lb-prog-bar-fill"
        style={{ width: `${w}%`, background: color }}
      />
    </div>
  );
}
