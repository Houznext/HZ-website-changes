import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  onClick?: () => void;
}

export default function KPICard({
  label,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
  onClick,
}: KPICardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-[#e2e8f0] bg-white p-4 flex items-center gap-3.5 text-left w-full
        hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      <div
        className="w-11 h-11 rounded-[11px] flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg }}
      >
        <Icon className="w-4 h-4" strokeWidth={1.8} style={{ color: iconColor }} />
      </div>
      <div className="min-w-0">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.07em] text-slate-400 mb-1">
          {label}
        </p>
        <p className="text-[24px] font-black text-[#1e293b] font-head leading-tight">{value}</p>
        {subtitle ? (
          <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
        ) : null}
      </div>
    </button>
  );
}
