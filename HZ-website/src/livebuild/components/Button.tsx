import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'blue' | 'ghost';
  size?: 'default' | 'sm' | 'xs';
  children: ReactNode;
  href?: string;
};

export default function Button({
  variant = 'blue',
  size = 'default',
  className = '',
  children,
  href,
  ...rest
}: Props) {
  const cls = [
    'btn',
    variant === 'blue' ? 'btn-blue' : 'btn-ghost',
    size === 'sm' ? 'btn-sm' : size === 'xs' ? 'btn-xs' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}
