"use client";

import React, { useMemo } from "react";
import StatusDropdown from "@/src/common/StatusDropdown";
import { status_options, statusColors } from "./types";
import {
  useCrmLeadStatusDefinitions,
  type CrmLeadStatusDefinition,
} from "@/src/hooks/useCrmLeadStatusDefinitions";

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

function labelFor(defs: CrmLeadStatusDefinition[], value: string) {
  const d = defs.find((x) => x.value === value);
  return (d?.label?.trim() || value) as string;
}

function buildFromDefinitions(definitions: CrmLeadStatusDefinition[]) {
  const sorted = [...definitions].sort(
    (a, b) =>
      a.sortOrder - b.sortOrder ||
      a.value.localeCompare(b.value),
  );
  const allValues = sorted.map((d) => d.value);
  const groupedValueSet = new Set<string>(
    STATUS_GROUPS.flatMap((g) => g.options),
  );

  const options = sorted.map((d) => ({
    value: d.value,
    label: d.label?.trim() || d.value,
    colorClass: statusColors[d.value] || "bg-gray-100 text-gray-700",
  }));

  const groups = STATUS_GROUPS.map((g) => ({
    label: g.label,
    options: g.options
      .filter((s) => allValues.includes(s))
      .map((s) => ({
        value: s,
        label: labelFor(sorted, s),
        colorClass: statusColors[s] || "bg-gray-100 text-gray-700",
      })),
  })).filter((g) => g.options.length > 0);

  const uncategorized = sorted
    .filter((d) => !groupedValueSet.has(d.value))
    .map((d) => ({
      value: d.value,
      label: d.label?.trim() || d.value,
      colorClass: statusColors[d.value] || "bg-gray-100 text-gray-700",
    }));

  if (uncategorized.length > 0) {
    groups.push({ label: "Other", options: uncategorized });
  }

  return { options, groups };
}

const staticOptions = status_options.map((s) => ({
  value: s,
  label: s,
  colorClass: statusColors[s] || "bg-gray-100 text-gray-700",
}));

const staticGroups = STATUS_GROUPS.map((g) => ({
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
  const { items: definitions } = useCrmLeadStatusDefinitions();

  const { options, groups } = useMemo(() => {
    if (definitions.length > 0) {
      return buildFromDefinitions(definitions);
    }
    return { options: staticOptions, groups: staticGroups };
  }, [definitions]);

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
