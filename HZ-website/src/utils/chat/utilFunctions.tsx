import React from "react";
import { PresenceStatus } from "./types";

export function getStatusColor(status: PresenceStatus) {
  switch (status) {
    case "online":
      return "bg-green-500";
    case "away":
      return "bg-yellow-500";
    case "offline":
    default:
      return "bg-gray-400";
  }
}

export function getStatusText(status: PresenceStatus) {
  switch (status) {
    case "online":
      return "Online";
    case "away":
      return "Away";
    case "offline":
    default:
      return "Offline";
  }
}

export function initials(name: string) {
  if (!name) return "";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export function getTimeHour(isoString: string): string {
  const date = new Date(isoString);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;
  const mm = minutes.toString().padStart(2, "0");
  return `${hours}:${mm}`;
}

export function IconBtn({
  label,
  className = "",
  onClick,
  type = "button",
  disabled,
  children,
}: {
  label: string;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={[
        "p-2 rounded-xl inline-flex items-center justify-center",
        disabled ? "opacity-60 cursor-not-allowed" : "",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
