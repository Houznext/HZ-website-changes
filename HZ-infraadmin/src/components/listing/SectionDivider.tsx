'use client';

import type { ReactNode } from 'react';

type Props = {
  icon: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  iconClassName?: string;
  iconBackground?: string;
};

export function SectionDivider({ icon, title, subtitle, iconClassName = '', iconBackground }: Props) {
  return (
    <div className="sdiv">
      <div className={`sdiv-icon ${iconClassName}`.trim()} style={iconBackground ? { background: iconBackground } : undefined}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="sdiv-title">{title}</div>
        {subtitle ? <div className="sdiv-sub">{subtitle}</div> : null}
      </div>
      <div className="sdiv-line" />
    </div>
  );
}
