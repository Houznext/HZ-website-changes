import React from "react";

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[14px] bg-white shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-slate-50/80 text-xs uppercase text-slate-500">{children}</thead>;
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>;
}

