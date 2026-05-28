import { ButtonHTMLAttributes, ReactNode } from 'react';

export type BtnVariant =
  | 'blue'
  | 'ghost'
  | 'tl'
  | 'red'
  | 'am'
  | 'accent'
  | 'icon';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant;
  size?: 'default' | 'sm' | 'xs';
  children?: ReactNode;
};

export function Btn({
  variant = 'blue',
  size = 'default',
  className = '',
  children,
  ...rest
}: Props) {
  const classes = [
    variant === 'icon' ? 'lb-btn-icon' : 'lb-btn',
    variant !== 'icon' ? `lb-btn-${variant}` : '',
    size === 'sm' ? 'lb-btn-sm' : '',
    size === 'xs' ? 'lb-btn-xs' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}
