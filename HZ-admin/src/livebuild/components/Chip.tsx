import { ReactNode } from 'react';

type Props = {
  selected?: boolean;
  onClick?: () => void;
  children: ReactNode;
};

export function Chip({ selected, onClick, children }: Props) {
  return (
    <span
      className={`lb-chip ${selected ? 'sel' : ''}`}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </span>
  );
}
