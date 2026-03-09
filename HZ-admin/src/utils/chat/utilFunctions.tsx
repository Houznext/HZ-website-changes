import Button from "@/src/common/Button";
import {  PresenceStatus } from "./types";
import { useEffect, useState } from "react";

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
  if(name === undefined || name === null) return "";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export function useIsBelow1300() {
  const [isBelow, setIsBelow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1299px)");
    const update = () => setIsBelow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isBelow;
}

export function getTimeHour(isoString: string): string {
  const date = new Date(isoString);

  let hours = date.getHours(); // 0–23
  const minutes = date.getMinutes();

  const isPM = hours >= 12;
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours; // 12 instead of 0

  const mm = minutes.toString().padStart(2, "0");

  return `${hours}:${mm}`;
}

/**
 * Formats a timestamp in WhatsApp-style:
 * - "Today" for today's messages
 * - "Yesterday" for yesterday's messages
 * - Day name (e.g., "Monday") for this week
 * - Date (e.g., "12/25/2024") for older messages
 * - Time (e.g., "10:30 AM") if same day
 */
export function formatWhatsAppTimestamp(isoString: string | null | undefined): string {
  if (!isoString) return "";

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffTime = today.getTime() - messageDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Same day - show time
  if (diffDays === 0) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours;
    const mm = minutes.toString().padStart(2, "0");
    return `${hours}:${mm} ${ampm}`;
  }

  // Yesterday
  if (diffDays === 1) {
    return "Yesterday";
  }

  // This week (within 7 days)
  if (diffDays < 7) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[date.getDay()];
  }

  // Older - show date
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}





import React from "react";

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
