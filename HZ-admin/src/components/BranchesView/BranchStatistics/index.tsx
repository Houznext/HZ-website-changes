"use client";

import { useMemo } from "react";

interface Branch {
  id: number;
  name: string;
  level: string;
  parentId?: number | null;
  isStateHQ?: boolean;
  isHeadOffice?: boolean;
  hasFranchiseFeePaid?: boolean;
  franchisePaymentRef?: string;
  category?: "GENERAL" | "CUSTOM_BUILDER" | "INTERIORS";
  parent?: { id: number; name: string } | null;
}

interface BranchStatisticsProps {
  branches: Branch[];
  selectedBranch: Branch | null;
  totalUsers: number;
  totalRoles: number;
  branchHasHead: boolean;
}

export default function BranchStatistics({
  branches,
  selectedBranch,
  totalUsers,
  totalRoles,
  branchHasHead,
}: BranchStatisticsProps) {
  const stats = useMemo(() => {
    const paidBranches = branches.filter((b) => b.hasFranchiseFeePaid).length;
    const categoryDisplay = selectedBranch?.category
      ? selectedBranch.category.replace("_", " ")
      : "—";

    return [
      {
        label: "Branches",
        value: branches.length,
        sub: selectedBranch ? selectedBranch.name : "All branches",
      },
      {
        label: "Users",
        value: selectedBranch ? totalUsers : "—",
        sub: selectedBranch ? "In selected branch" : "Select a branch",
      },
      {
        label: "Roles",
        value: selectedBranch ? totalRoles : "—",
        sub: branchHasHead ? "Has branch head" : selectedBranch ? "No branch head" : "—",
      },
      {
        label: "Category",
        value: categoryDisplay,
        sub: selectedBranch?.level ?? "—",
      },
      {
        label: "Franchise",
        value: selectedBranch
          ? selectedBranch.hasFranchiseFeePaid
            ? "Paid"
            : "Pending"
          : "—",
        sub: `${paidBranches} / ${branches.length} paid`,
      },
    ];
  }, [branches, selectedBranch, totalUsers, totalRoles, branchHasHead]);

  return (
    <div className="br-stats">
      {stats.map((stat) => (
        <div key={stat.label} className="br-stat">
          <div className="br-stat-lbl">{stat.label}</div>
          <div className="br-stat-val">{stat.value}</div>
          <div className="br-stat-sub">{stat.sub}</div>
        </div>
      ))}
    </div>
  );
};
