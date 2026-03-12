import React from "react";
import Card from "./Card";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: number;
}

export default function StatCard({
  icon,
  label,
  value,
  trend,
}: StatCardProps) {
  return (
    <Card className="p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-[#1f2933]">{value}</p>
        </div>
        <div className="h-9 w-9 rounded-xl bg-[rgba(47,128,237,0.08)] flex items-center justify-center text-[#2f80ed]">
          {icon}
        </div>
      </div>
      {typeof trend === "number" && (
        <p
          className={`text-xs font-medium ${
            trend >= 0 ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}% vs last period
        </p>
      )}
    </Card>
  );
}

