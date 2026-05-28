import type { HTMLAttributes, ReactNode } from 'react';

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  small?: boolean;
};

export default function Card({ children, small, className = '', ...rest }: Props) {
  return (
    <div className={`${small ? 'card-sm' : 'card'} ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
