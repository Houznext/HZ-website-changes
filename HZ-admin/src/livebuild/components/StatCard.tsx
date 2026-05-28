import { ReactNode } from 'react';

type Props = {
  label: string;
  value: ReactNode;
  sub?: string;
  icon: ReactNode;
  iconBg?: string;
  valueColor?: string;
  onClick?: () => void;
  className?: string;
};

export function StatCard({
  label,
  value,
  sub,
  icon,
  iconBg = '#e8f1fd',
  valueColor,
  onClick,
  className = '',
}: Props) {
  return (
    <div
      className={`lb-stat ${className}`.trim()}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="lb-stat-ic" style={{ background: iconBg }}>
        {icon}
      </div>
      <div>
        <div className="lb-stat-lbl">{label}</div>
        <div className="lb-stat-val" style={valueColor ? { color: valueColor } : undefined}>
          {value}
        </div>
        {sub ? <div className="lb-stat-sub">{sub}</div> : null}
      </div>
    </div>
  );
}
