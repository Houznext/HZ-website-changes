import React from "react";

type BadgeColor = "green" | "amber" | "gray" | "blue";

const map: Record<BadgeColor, string> = {
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  gray: "bg-slate-50 text-slate-600 border-slate-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function Badge({
  color,
  children,
}: {
  color: BadgeColor;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${map[color]}`}
    >
      {children}
    </span>
  );
}

