import React from 'react'

interface EyebrowLabelProps {
  children: React.ReactNode
  className?: string
}

export default function EyebrowLabel({ children, className = '' }: EyebrowLabelProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="inline-block w-6 h-0.5 bg-accent" />
      <span className="font-head font-bold text-[11px] uppercase tracking-[0.12em] text-[#2f80ed]">
        {children}
      </span>
    </div>
  )
}
