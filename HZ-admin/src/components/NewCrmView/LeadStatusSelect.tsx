"use client";

import React from "react";
import StatusDropdown from "@/src/common/StatusDropdown";
import { status_options, statusColors } from "./types";

const STATUS_GROUPS = [
  {
    label: "Pipeline",
    options: [
      "New",
      "Contacted",
      "Qualified",
      "Proposal Sent",
      "Negotiation",
      "Follow-up",
      "Interested",
      "Site Visit",
      "Visit Scheduled",
      "Visit Done",
    ],
  },
  {
    label: "Won / Closed",
    options: ["Won", "completed", "Closed"],
  },
  {
    label: "Rejected / Lost",
    options: ["Not Interested", "Rejected", "Lost"],
  },
  {
    label: "Unreachable",
    options: ["Not Lifted", "Not Answered", "Switched Off", "Wrong Number", "DND"],
  },
];

const options = status_options.map((s) => ({
  value: s,
  label: s,
  colorClass: statusColors[s] || "bg-gray-100 text-gray-700",
}));

const groups = STATUS_GROUPS.map((g) => ({
  label: g.label,
  options: g.options
    .filter((s) => (status_options as readonly string[]).includes(s))
    .map((s) => ({
      value: s,
      label: s,
      colorClass: statusColors[s] || "bg-gray-100 text-gray-700",
    })),
})).filter((g) => g.options.length > 0);

interface LeadStatusSelectProps {
  value: string;
  onChange: (status: string) => void;
  variant?: "compact" | "full";
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export default function LeadStatusSelect({
  value,
  onChange,
  variant = "compact",
  disabled = false,
  onClick,
}: LeadStatusSelectProps) {
  return (
    <StatusDropdown
      value={value}
      options={options}
      groups={groups}
      onChange={onChange}
      variant={variant}
      disabled={disabled}
      onClick={onClick}
    />
  );
}
