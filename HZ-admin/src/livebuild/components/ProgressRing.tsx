type Props = {
  pct: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  light?: boolean;
};

export function ProgressRing({
  pct,
  size = 80,
  strokeWidth = 7,
  color = 'var(--lb-blue)',
  label,
  light = false,
}: Props) {
  const clamped = Math.min(100, Math.max(0, pct));
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={light ? 'rgba(255,255,255,.2)' : '#e2e8f0'}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={light ? 'rgba(255,255,255,.9)' : color}
          strokeWidth={strokeWidth}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--lb-m)',
        }}
      >
        <span
          style={{
            fontSize: size > 70 ? 18 : 14,
            fontWeight: 800,
            color: light ? '#fff' : 'var(--lb-ch)',
          }}
        >
          {Math.round(clamped)}%
        </span>
        {label ? (
          <span
            style={{
              fontSize: 9,
              color: light ? 'rgba(255,255,255,.7)' : 'var(--lb-mu)',
              fontWeight: 600,
            }}
          >
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
