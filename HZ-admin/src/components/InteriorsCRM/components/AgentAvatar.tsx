import { twMerge } from "tailwind-merge";

interface AgentAvatarProps {
  name: string;
  size?: number;
  className?: string;
}

const PALETTE = ["#2563eb", "#6d28d9", "#0d9488", "#c2410c", "#ca8a04", "#a21caf"];

function initials(name: string) {
  const p = (name || "U").trim().split(/\s+/);
  const a = p[0]?.[0] || "U";
  const b = p[1]?.[0] || "";
  return (a + b).toUpperCase();
}

export default function AgentAvatar({ name, size = 36, className = "" }: AgentAvatarProps) {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const bg = PALETTE[hash % PALETTE.length];
  return (
    <div
      className={twMerge(
        "rounded-full flex items-center justify-center text-white font-bold text-[11px] flex-shrink-0",
        className,
      )}
      style={{ width: size, height: size, background: bg }}
    >
      {initials(name)}
    </div>
  );
}
