import type { ReactNode } from 'react';

const VARIANT: Record<string, string> = {
  blue: 'b-blue',
  amber: 'b-amber',
  gray: 'b-gray',
  red: 'b-red',
  pu: 'b-pu',
  navy: 'b-navy',
  prog: 'b-prog',
};

type Props = {
  children: ReactNode;
  variant?: keyof typeof VARIANT | string;
  className?: string;
  style?: React.CSSProperties;
};

export default function Badge({ children, variant = 'blue', className = '', style }: Props) {
  const cls = VARIANT[variant] ?? variant;
  return (
    <span className={`bdg ${cls} ${className}`.trim()} style={style}>
      {children}
    </span>
  );
}
