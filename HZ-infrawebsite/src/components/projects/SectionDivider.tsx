import type { ReactNode } from 'react';

type Props = {
  title: string;
  icon: ReactNode;
  iconBg?: string;
  trailing?: ReactNode;
};

export function SectionDivider({ title, icon, iconBg = 'var(--blue-light)', trailing }: Props) {
  return (
    <div className="sdiv">
      <div className="sdiv-ic" style={{ background: iconBg }}>
        {icon}
      </div>
      <div className="sdiv-title">{title}</div>
      <div className="sdiv-line" />
      {trailing}
    </div>
  );
}
