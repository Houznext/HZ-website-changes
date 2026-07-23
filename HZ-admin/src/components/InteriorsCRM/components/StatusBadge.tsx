import { STATUS_BADGE_STYLES } from "../constants";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const style = STATUS_BADGE_STYLES[status] || { bg: "#f1f5f9", text: "#475569" };
  const sizeClass =
    size === "sm" ? "text-[9.5px] px-2 py-[1px]" : "text-[10.5px] px-2.5 py-0.5";
  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full whitespace-nowrap ${sizeClass}`}
      style={{ background: style.bg, color: style.text }}
    >
      {status}
    </span>
  );
}
