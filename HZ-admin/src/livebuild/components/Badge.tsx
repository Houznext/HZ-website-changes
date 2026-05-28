import { ReactNode } from 'react';

export type BadgeVariant =
  | 'blue'
  | 'amber'
  | 'gray'
  | 'red'
  | 'tl'
  | 'pu'
  | 'navy'
  | 'prog';

type Props = {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
};

export function Badge({ variant = 'gray', children, className = '' }: Props) {
  return (
    <span className={`lb-bdg lb-b-${variant} ${className}`.trim()}>{children}</span>
  );
}
