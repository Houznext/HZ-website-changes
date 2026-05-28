import { ReactNode } from 'react';

type Props = {
  title: string;
  icon?: ReactNode;
  iconBg?: string;
  hint?: ReactNode;
};

export function SectionDivider({ title, icon, iconBg = 'var(--lb-bl)', hint }: Props) {
  return (
    <div className="lb-sdiv" style={{ marginTop: 0 }}>
      {icon ? (
        <div className="lb-sdiv-ic" style={{ background: iconBg }}>
          {icon}
        </div>
      ) : null}
      <div className="lb-sdiv-t">{title}</div>
      <div className="lb-sdiv-line" />
      {hint ? <span style={{ fontSize: 11, color: 'var(--lb-mu)' }}>{hint}</span> : null}
    </div>
  );
}
