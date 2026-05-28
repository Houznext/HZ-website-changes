import { useEffect, useState } from 'react';

type Props = {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  subLabel?: string;
  className?: string;
};

export default function ProgressRing({
  pct,
  size = 72,
  stroke = 6,
  color = 'var(--blue)',
  trackColor = 'rgba(255,255,255,.2)',
  label,
  subLabel,
  className = '',
}: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, pct));
  const offset = c * (1 - clamped / 100);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(t);
  }, [clamped]);

  return (
    <div className={`ring-wrap ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={animated ? offset : c}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: 'stroke-dashoffset 1s ease',
            ['--ring-offset' as string]: String(offset),
          }}
        />
      </svg>
      {(label != null || subLabel != null) && (
        <div
          className="ring-label"
          style={{ fontSize: size < 56 ? 11 : 14, lineHeight: 1.1, color: label?.includes('%') ? '#fff' : undefined }}
        >
          {label != null && <div>{label}</div>}
          {subLabel != null && (
            <div style={{ fontSize: 9, fontWeight: 600, opacity: 0.65 }}>{subLabel}</div>
          )}
        </div>
      )}
    </div>
  );
}
