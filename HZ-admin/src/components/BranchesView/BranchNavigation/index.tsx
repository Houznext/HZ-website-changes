"use client";

import { useState, useMemo, useEffect } from "react";
import {
    Search,
    Building2,
    MapPin,
    Navigation,
    Home,
    Building,
    ChevronRight,
    Star,
    Filter,
    X,
    ArrowLeft,
    Layers,
    Tag,
    CheckCircle,
    XCircle,
    RotateCcw,
} from "lucide-react";
import Button from "@/src/common/Button";

interface Branch {
    id: number;
    name: string;
    level: string;
    path?: string;
    isStateHQ?: boolean;
    isActive?:boolean;
    isHeadOffice?: boolean;
    hasFranchiseFeePaid?: boolean;
    franchisePaymentRef?: string;
    category?: "GENERAL" | "CUSTOM_BUILDER" | "INTERIORS";
    parent?: { id: number; name: string } | null;
    parentId?: number | null;
}

interface BranchNavigationProps {
    branches: Branch[];
    selectedId?: string;
    onSelect: (id: string) => void;
    onEdit: (branch: Branch) => void;
    onDelete: (branch: Branch) => void;
}

const LEVEL_CONFIG: Record<string, { icon: any; label: string; color: string; bgColor: string }> = {
    ORG: { icon: Building2, label: "Organization", color: "text-purple-600", bgColor: "bg-purple-50" },
    STATE: { icon: MapPin, label: "State", color: "text-blue-600", bgColor: "bg-blue-50" },
    CITY: { icon: Navigation, label: "City", color: "text-green-600", bgColor: "bg-green-50" },
    AREA: { icon: Home, label: "Area", color: "text-orange-600", bgColor: "bg-orange-50" },
    OFFICE: { icon: Building, label: "Office", color: "text-indigo-600", bgColor: "bg-indigo-50" },
};

export default function BranchNavigation({
    branches,
    selectedId,
    onSelect,
    onEdit,
    onDelete,
}: BranchNavigationProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [levelFilter, setLevelFilter] = useState<string>("ALL");
    const [showFilters, setShowFilters] = useState(false);

    // Get selected branch
    const selectedBranch = useMemo(
        () => branches.find((b) => String(b.id) === selectedId),
        [branches, selectedId]
    );

    // Build breadcrumb path
    const breadcrumbs = useMemo(() => {
        if (!selectedBranch) return [];
        const path: Branch[] = [];
        let current: Branch | undefined = selectedBranch;

        while (current) {
            path.unshift(current);
            current = branches.find((b) => b.id === current?.parent?.id);
        }

        return path;
    }, [selectedBranch, branches]);


    const children = useMemo(
        () => branches.filter((b) => b.parent?.id === selectedBranch?.id),
        [branches, selectedBranch]
    );
    //     const children = useMemo(() => {
    //     if (!selectedBranch) return [];


    //     const prefix = `${selectedBranch.path}.`;

    //     return branches.filter((b) => 
    //         b.id !== selectedBranch.id &&       
    //         b.path.startsWith(prefix)            
    //     );
    // }, [branches, selectedBranch]);


    // Search and filter branches
    const filteredBranches = useMemo(() => {
        let result = branches;

        // Apply search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter((b) =>
                b.name.toLowerCase().includes(query) ||
                b.level.toLowerCase().includes(query)
            );
        }

        // Apply level filter
        if (levelFilter !== "ALL") {
            result = result.filter((b) => b.level === levelFilter);
        }

        return result;
    }, [branches, searchQuery, levelFilter]);

    // Count branches by level
    const levelCounts = useMemo(() => {
        const counts: Record<string, number> = { ALL: branches.length };
        branches.forEach((b) => {
            counts[b.level] = (counts[b.level] || 0) + 1;
        });
        return counts;
    }, [branches]);

    const BranchCard = ({ branch }: { branch: Branch }) => {
        const config = LEVEL_CONFIG[branch.level] || LEVEL_CONFIG.OFFICE;
        const Icon = config.icon;
        const isSelected = String(branch.id) === selectedId;
        const childCount = branches.filter((b) => b.parent?.id === branch.id).length;
        

        const isInactive = !branch.isActive;


        return (
            <div
               onClick={() => {
          if (!isInactive) {
            onSelect(String(branch.id));
          }
        }}
        // className={`group relative px-4 py-2 rounded-[6px] border transition-all duration-200 cursor-pointer ${isSelected
        //     ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400 shadow-md ring-2 ring-blue-200"
        //     : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md"
        //     }`}
        className={`
    group relative px-4 py-2 rounded-[6px] border transition-all duration-200
    ${
      isInactive
        ? "bg-gray-100 border-gray-300 opacity-60 "
        : isSelected
          ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400 shadow-md ring-2 ring-blue-200 cursor-pointer"
          : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer"
    }
  `}>
                {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600 rounded-l-xl"></div>
                )}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`p-2 ${config.bgColor} rounded-lg border border-gray-200 flex-shrink-0`}>
                            <Icon className={`w-5 h-5 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="font-bold text-sm text-gray-900 truncate">
                                    {branch.name}
                                </h3>
                                {branch.isHeadOffice && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 rounded-full border border-yellow-300">
                                        <Star className="w-3 h-3" /> HQ
                                    </span>
                                )}
                                {branch.isStateHQ && (
                                    <span className="inline-flex px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full border border-blue-300">
                                        State HQ
                                    </span>
                                )}
                                {branch.hasFranchiseFeePaid ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-full border border-green-300">
                                        <CheckCircle className="w-3 h-3" /> Paid
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-red-100 to-red-200 text-red-800 rounded-full border border-red-300">
                                        <XCircle className="w-3 h-3" /> Pending
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap">
                                <span className="font-medium">{config.label}</span>
                                {branch.category && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                                        <Tag className="w-3 h-3" />
                                        <span className="font-bold text-[10px]">{branch.category.replace("_", " ")}</span>
                                    </span>
                                )}
                                {childCount > 0 && (
                                    <span className="flex items-center gap-1">
                                        <Layers className="w-3 h-3" />
                                        <span className="font-bold text-blue-600">{childCount}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       {branch.isActive && (
                        <>
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(branch);
                            }}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 border border-blue-200"
                            title="Edit"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </Button>
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(branch);
                            }}
                            className="p-1.5 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 border border-red-200"
                            title="Delete"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </Button> </>)}
                        {!branch.isActive && (
    <>
      {/* Restore */}
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onDelete({ ...branch, action: "restore" } as any);
        }}
        className="p-1.5 bg-green-50 hover:bg-green-100 rounded-lg text-green-600 border border-green-200"
        title="Restore"
      >
       <RotateCcw size={14} />
      </Button>

      
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onDelete({ ...branch, action: "hard" } as any);
        }}
        className="p-1.5 bg-red-100 hover:bg-red-200 rounded-lg text-red-700 border border-red-300"
        title="Hard Delete"
      >
        <XCircle size={14} />
      </Button>
    </>
  )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-white rounded-[6px] border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex-shrink-0 p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg shadow-md">
                        <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Branch Navigation</h2>
                        <p className="text-xs text-gray-500 font-medium">
                            {branches.length} branches • {children.length} children in current
                        </p>
                    </div>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search branches by name or level..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-8 py-[6px] bg-white border border-gray-300 rounded-lg text-sm  focus:ring-blue-500 focus:border-blue-500 font-regular placeholder:text-[13px]"
                    />
                    {searchQuery && (
                        <Button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </Button>
                    )}
                </div>

                <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-[2px] custom-scrollbar">
                    <Button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-all ${showFilters
                            ? "bg-blue-100 text-blue-700 border-blue-300"
                            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                            }`}
                    >
                        <Filter className="w-3.5 h-3.5" />
                        Filters
                    </Button>

                    {["ALL", "ORG", "STATE", "CITY", "AREA", "OFFICE"].map((level) => (
                        <Button
                            key={level}
                            onClick={() => setLevelFilter(level)}
                            className={`flex items-center gap-1.5 px-3 py-[1px] rounded-[6px] text-[10px] md:text-[12px] font-bold border transition-all whitespace-nowrap  ${levelFilter === level
                                ? "bg-blue-500 text-white border-blue-600 shadow-sm"
                                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            {level === "ALL" ? "All" : LEVEL_CONFIG[level]?.label || level}
                            <span className="px-1.5 py-[2px] bg-black/10 rounded-full text-[10px]">
                                {levelCounts[level] || 0}
                            </span>
                        </Button>
                    ))}
                </div>
            </div>

            {selectedBranch && breadcrumbs?.length > 0 && (
                <div className="flex-shrink-0 px-4 py-2  bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-200">
                    <div className="flex items-center gap-2  custom-scrollbar">
                        <Button
                            onClick={() => onSelect("")}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Root
                        </Button>
                        {breadcrumbs?.length > 0 && breadcrumbs.map((crumb, index) => {
                            const config = LEVEL_CONFIG[crumb.level] || LEVEL_CONFIG.OFFICE;
                            const Icon = config.icon;
                            const isLast = index === breadcrumbs.length - 1;

                            return (
                                <div key={crumb.id} className="flex items-center gap-2">
                                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <Button
                                        onClick={() => !isLast && onSelect(String(crumb.id))}
                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${isLast
                                            ? "bg-blue-100 text-blue-700 border border-blue-300"
                                            : "bg-white text-gray-700 border border-gray-300 hover:bg-blue-50"
                                            }`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        {crumb.name}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4">
                {searchQuery || levelFilter !== "ALL" ? (
                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-700">
                                Search Results ({filteredBranches.length})
                            </h3>
                            {(searchQuery || levelFilter !== "ALL") && (
                                <Button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setLevelFilter("ALL");
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Clear filters
                                </Button>
                            )}
                        </div>
                        {filteredBranches.length > 0 ? (
                            <div className="grid gap-3">
                                {filteredBranches.map((branch) => (
                                    <BranchCard key={branch.id} branch={branch} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-[6px] border-2 border-dashed border-gray-300">
                                <Search className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                                <h3 className="text-sm font-bold text-gray-700 mb-1">
                                    No branches found
                                </h3>
                                <p className="text-xs text-gray-600 font-medium">
                                    Try adjusting your search or filters
                                </p>
                            </div>
                        )}
                    </div>
                ) : selectedBranch ? (
                    <div>
                        <div className="mb-4 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-[6px] border border-blue-200">
                            <BranchCard branch={selectedBranch} />
                        </div>

                        {children.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-blue-600" />
                                    Child Branches ({children.length})
                                </h3>
                                <div className="grid gap-3">
                                    {children.map((branch) => (
                                        <BranchCard key={branch.id} branch={branch} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {children.length === 0 && (
                            <div className="text-center py-8 bg-gray-50 rounded-[6px] border-2 border-dashed border-gray-300">
                                <Building2 className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                <p className="text-xs text-gray-600 font-medium">
                                    No child branches
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    // Root Level View
                    <div>
                        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-600" />
                            Root Level Branches ({branches.filter((b) => !b.parent?.id).length})
                        </h3>
                        <div className="grid gap-3">
                            {branches
                                .filter((b) => !b.parent?.id)
                                .map((branch) => (
                                    <BranchCard key={branch.id} branch={branch} />
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}