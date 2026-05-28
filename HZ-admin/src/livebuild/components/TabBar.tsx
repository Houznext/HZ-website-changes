import { ReactNode } from 'react';

export type TabItem<T extends string = string> = {
  id: T;
  label: ReactNode;
  count?: number;
};

type Props<T extends string = string> = {
  tabs: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
};

export function TabBar<T extends string = string>({ tabs, active, onChange, className = '' }: Props<T>) {
  return (
    <div className={`lb-tab-bar ${className}`.trim()}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`lb-tab ${active === tab.id ? 'on' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {tab.count != null ? ` (${tab.count})` : ''}
        </button>
      ))}
    </div>
  );
}
