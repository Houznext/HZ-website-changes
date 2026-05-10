import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

const variants = {
  primary: 'bg-hz-blue text-hzwhite hover:bg-hz-blue-hover',
  accent: 'bg-hz-accent text-hzwhite hover:brightness-95',
  ghost: 'bg-hzwhite text-charcoal border border-border hover:border-hz-blue hover:text-hz-blue hover:bg-hz-blue-light',
  navy: 'bg-navy text-hzwhite hover:bg-[#1a3a5c]',
};

type Variant = keyof typeof variants;

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
};

export function Button({ variant = 'primary', className, children, ...rest }: Props) {
  return (
    <button
      type="button"
      className={clsx(
        'inline-flex items-center justify-center gap-1.5 rounded-lg px-5 py-2.5 text-[13px] font-bold tracking-wide transition-transform font-montserrat',
        variants[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
