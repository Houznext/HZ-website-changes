import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'outline-white' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}

const baseClasses =
  'inline-flex items-center justify-center font-head font-bold rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-[#2f80ed] text-white hover:bg-[#1a6dd6] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(47,128,237,0.4)] active:bg-[#1558b0] focus-visible:ring-[#2f80ed]',
  outline:
    'bg-transparent border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-white focus-visible:ring-charcoal',
  'outline-white':
    'bg-transparent border border-white/25 text-white hover:bg-white/10 focus-visible:ring-white',
  ghost:
    'bg-transparent text-[#2f80ed] hover:bg-blue-light focus-visible:ring-[#2f80ed]',
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm:   'px-4 py-2 text-sm',
  md:   'px-6 py-3 text-sm',
  lg:   'px-8 py-4 text-base',
  icon: 'p-2',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
