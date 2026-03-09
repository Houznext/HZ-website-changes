import { forwardRef, Children, isValidElement } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';

interface ButtonOptions {
  href?: string;
  buttonType?: 'primary' | 'secondary' | 'black';
  variant?: 'outline' | 'filled' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

type ButtonRef = HTMLButtonElement;

export type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<ButtonRef>,
  ButtonRef
> &
  ButtonOptions;

const Button = forwardRef<ButtonRef, ButtonProps>((props, ref) => {
  const {
    children,
    type = 'button',
    buttonType = 'primary',
    className = '',
    variant = 'filled',
    size = 'md',
    disabled = false,
    href = '',
    onClick,
    ...rest
  } = props;

  // Don't nest <Link> inside <button> (invalid HTML, causes hydration errors). Use Link as the root when href is set.
  if (href) {
    return (
      <Link href={href} className={className} onClick={onClick as any} style={{ display: 'inline-block' }}>
        {children}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      className={className}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
