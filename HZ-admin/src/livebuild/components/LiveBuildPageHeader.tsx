import type { ReactNode } from 'react';

type Props = {
  title: ReactNode;
  subtitle?: string;
  actions?: ReactNode;
  leading?: ReactNode;
};

export function LiveBuildPageHeader({ title, subtitle, actions, leading }: Props) {
  return (
    <div className="lb-topbar">
      {leading}
      <div>
        <div className="lb-tb-title">{title}</div>
        {subtitle ? <div className="lb-tb-sub">{subtitle}</div> : null}
      </div>
      {actions ? (
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          {actions}
        </div>
      ) : null}
    </div>
  );
}
