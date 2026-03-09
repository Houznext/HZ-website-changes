"use client";

import { useMemo } from "react";
import {
    Building2,
    Users,
    ShieldCheck,
    TrendingUp,
    MapPin,
    Crown,
    Activity,
    DollarSign,
    Tag,
} from "lucide-react";

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

interface StatCard {
    title: string;
    value: string | number;
    icon: any;
    gradient: string;
    iconBg: string;
    change?: string;
    changeType?: "positive" | "negative" | "neutral";
}

export default function BranchStatistics({
    branches,
    selectedBranch,
    totalUsers,
    totalRoles,
    branchHasHead,
}: BranchStatisticsProps) {
    const stats = useMemo(() => {
        const totalBranches = branches.length;
        const orgLevel = branches.filter((b) => b.level === "ORG").length;
        const stateLevel = branches.filter((b) => b.level === "STATE").length;
        const cityLevel = branches.filter((b) => b.level === "CITY").length;
        const areaLevel = branches.filter((b) => b.level === "AREA").length;
        const paidBranches = branches.filter((b) => b.hasFranchiseFeePaid).length;

        // Category display
        const categoryDisplay = selectedBranch?.category 
            ? selectedBranch.category.replace("_", " ")
            : "—";

        // Franchise status
        const franchiseStatus = selectedBranch
            ? selectedBranch.hasFranchiseFeePaid
                ? "Paid"
                : "Pending"
            : "—";

        const statsData: StatCard[] = [
            {
                title: "Total Branches",
                value: totalBranches,
                icon: Building2,
                gradient: "from-blue-500 to-blue-600",
                iconBg: "bg-blue-100",
                change: selectedBranch ? `Selected: ${selectedBranch.name}` : "All branches",
                changeType: "neutral",
            },
            {
                title: "Active Users",
                value: selectedBranch ? totalUsers : "—",
                icon: Users,
                gradient: "from-gray-500 to-gray-600",
                iconBg: "bg-gray-100",
                change: selectedBranch ? `In ${selectedBranch.name}` : "Select a branch",
                changeType: "positive",
            },
            {
                title: "Total Roles",
                value: selectedBranch ? totalRoles : "—",
                icon: ShieldCheck,
                gradient: "from-purple-500 to-purple-600",
                iconBg: "bg-purple-100",
                change: selectedBranch
                    ? branchHasHead
                        ? "Has Branch Head"
                        : "No Branch Head"
                    : "Select a branch",
                changeType: branchHasHead ? "positive" : "neutral",
            },
            {
                title: "Branch Category",
                value: categoryDisplay,
                icon: Tag,
                gradient: "from-indigo-500 to-indigo-600",
                iconBg: "bg-indigo-100",
                change: selectedBranch ? `Type: ${selectedBranch.level}` : "Select a branch",
                changeType: "neutral",
            },
            {
                title: "Franchise Status",
                value: franchiseStatus,
                icon: DollarSign,
                gradient: "from-emerald-500 to-emerald-600",
                iconBg: "bg-emerald-100",
                change: `${paidBranches} of ${totalBranches} paid`,
                changeType: selectedBranch?.hasFranchiseFeePaid ? "positive" : "neutral",
            },
            {
                title: "Branch Levels",
                value: `${stateLevel}S / ${cityLevel}C / ${areaLevel}A`,
                icon: MapPin,
                gradient: "from-orange-500 to-orange-600",
                iconBg: "bg-orange-100",
                change: `${orgLevel} HQ`,
                changeType: "neutral",
            },
        ];

        return statsData;
    }, [branches, selectedBranch, totalUsers, totalRoles, branchHasHead]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="relative group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                    <div
                        className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                    ></div>

                    <div className="relative p-2 md:p-3">
                        <div className="flex items-start justify-between mb-1 text-[12px] md:text-[14px]">
                            <div className={`p-3 rounded-lg ${stat.iconBg} shadow-sm`}>
                                <stat.icon className="w-4 h-4 md:w-3 md:h-3 text-gray-700" />
                            </div>
                            {stat.title === "Total Roles" && branchHasHead && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded-full">
                                    <Crown className="w-3 h-3 text-yellow-700" />
                                    <span className="text-[10px] font-bold text-yellow-700">
                                        HEAD
                                    </span>
                                </div>
                            )}
                            <div className="space-y-1">
                                <h3 className="text-[12px] md:text-[14px] font-medium text-gray-600  tracking-wide">
                                    {stat.title}
                                </h3>
                                <p className="text-[12px] md:text-[14px] font-bold text-gray-900">
                                    {stat.value}
                                </p>
                            </div>
                        </div>

                        {stat.change && (
                            <div className=" flex items-center gap-2">
                                <div
                                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${stat.changeType === "positive"
                                        ? "bg-green-100 text-gray-700"
                                        : stat.changeType === "negative"
                                            ? "bg-red-100 text-red-700"
                                            : "bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    {stat.changeType === "positive" && (
                                        <TrendingUp className="w-3 h-3" />
                                    )}
                                    {stat.changeType === "neutral" && (
                                        <Activity className="w-3 h-3" />
                                    )}
                                    <span className="text-[10px] md:text-xs">{stat.change}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div
                        className={`h-1 bg-gradient-to-r ${stat.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}
                    ></div>
                </div>
            ))}
        </div>
    );
}