import { useEffect, useState } from 'react';

type Props = {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  subLabel?: string;
  /** Show percentage inside ring when label omitted */
  showLabel?: boolean;
  labelColor?: string;
  className?: string;
};

export default function ProgressRing({
  pct,
  size = 72,
  stroke = 6,
  color = 'var(--blue)',
  trackColor = '#e2e8f0',
  label,
  subLabel,
  showLabel = true,
  labelColor = 'var(--ch)',
  className = '',
}: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, pct));
  const offset = c * (1 - clamped / 100);
  const [animated, setAnimated] = useState(false);
  const cx = size / 2;
  const cy = size / 2;

  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(t);
  }, [clamped]);

  const displayLabel = label ?? (showLabel ? `${Math.round(clamped)}%` : undefined);
  const fontSize = size <= 38 ? 10 : size <= 52 ? 11 : size <= 64 ? 13 : 14;
  const subFontSize = Math.max(7, fontSize - 3);

  return (
    <div className={`ring-wrap ${className}`} style={{ width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={animated ? offset : c}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        {displayLabel != null && subLabel == null && (
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fill={labelColor}
            fontSize={fontSize}
            fontFamily="Montserrat, sans-serif"
            fontWeight={800}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {displayLabel}
          </text>
        )}
        {displayLabel != null && subLabel != null && (
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fill={labelColor}
            fontSize={fontSize}
            fontFamily="Montserrat, sans-serif"
            fontWeight={800}
          >
            <tspan x={cx} dy={-subFontSize * 0.45}>
              {displayLabel}
            </tspan>
            <tspan x={cx} dy={fontSize * 0.95} fontSize={subFontSize} fontWeight={600} opacity={0.65}>
              {subLabel}
            </tspan>
          </text>
        )}
        {displayLabel == null && subLabel != null && (
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fill={labelColor}
            fontSize={subFontSize}
            fontFamily="Montserrat, sans-serif"
            fontWeight={600}
            opacity={0.65}
          >
            {subLabel}
          </text>
        )}
      </svg>
    </div>
  );
}
