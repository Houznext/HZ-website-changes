import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-white rounded-[16px] shadow-[0_6px_24px_rgba(0,0,0,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}

