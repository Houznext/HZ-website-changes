"use client";

import { useState, useMemo } from "react";
import { Search, X, Filter, ArrowLeft, ChevronRight } from "lucide-react";
import Button from "@/src/common/Button";

interface Branch {
  id: number;
  name: string;
  level: string;
  path?: string;
  isStateHQ?: boolean;
  isActive?: boolean;
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

function levelBadgeClass(level: string): string {
  switch (level) {
    case "ORG":
      return "b-navy";
    case "STATE":
      return "b-blue";
    case "CITY":
      return "b-teal";
    case "AREA":
      return "b-amber";
    case "OFFICE":
      return "b-gray";
    default:
      return "b-gray";
  }
}

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

  const selectedBranch = useMemo(
    () => branches.find((b) => String(b.id) === selectedId),
    [branches, selectedId],
  );

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
    [branches, selectedBranch],
  );

  const filteredBranches = useMemo(() => {
    let result = branches;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
          b.level.toLowerCase().includes(query),
      );
    }
    if (levelFilter !== "ALL") {
      result = result.filter((b) => b.level === levelFilter);
    }
    return result;
  }, [branches, searchQuery, levelFilter]);

  const levelCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: branches.length };
    branches.forEach((b) => {
      counts[b.level] = (counts[b.level] || 0) + 1;
    });
    return counts;
  }, [branches]);

  const BranchRow = ({ branch }: { branch: Branch }) => {
    const isSelected = String(branch.id) === selectedId;
    const isInactive = branch.isActive === false;

    return (
      <div
        className={`group flex items-center gap-1 ${isInactive ? "br-tree-btn inactive" : ""}`}
      >
        <button
          type="button"
          className={`btn btn-ghost btn-sm br-tree-btn ${isSelected ? "active" : ""}`}
          disabled={isInactive}
          onClick={() => {
            if (!isInactive) onSelect(String(branch.id));
          }}
        >
          <span className={`bdg ${levelBadgeClass(branch.level)}`}>{branch.level}</span>
          <span style={{ marginLeft: 8, flex: 1, textAlign: "left" }}>{branch.name}</span>
          {branch.isHeadOffice ? (
            <span className="bdg b-amber" style={{ marginLeft: 4 }}>
              HQ
            </span>
          ) : null}
          {branch.isStateHQ ? (
            <span className="bdg b-blue" style={{ marginLeft: 4 }}>
              State HQ
            </span>
          ) : null}
        </button>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {branch.isActive !== false ? (
            <>
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                title="Edit"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(branch);
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn-danger btn-xs"
                title="Delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(branch);
                }}
              >
                Del
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete({ ...branch, action: "restore" } as Branch & { action: string });
                }}
              >
                Restore
              </button>
              <button
                type="button"
                className="btn btn-danger btn-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete({ ...branch, action: "hard" } as Branch & { action: string });
                }}
              >
                Purge
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const listTitle = searchQuery || levelFilter !== "ALL" ? "Search results" : selectedBranch ? "Child branches" : "Root branches";

  const listBranches =
    searchQuery || levelFilter !== "ALL"
      ? filteredBranches
      : selectedBranch
        ? children
        : branches.filter((b) => !b.parent?.id);

  return (
    <div>
      <div className="acard-hd" style={{ marginBottom: 10 }}>
        <h3>Branch tree</h3>
        <span className="bdg b-gray">{branches.length} total</span>
      </div>

      <input
        type="text"
        className="fi"
        placeholder="Search by name or level…"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="br-toolbar" style={{ paddingTop: 10, paddingBottom: 6 }}>
        <button
          type="button"
          className={`chip ${showFilters ? "sel" : ""}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-3.5 h-3.5" />
          Filters
        </button>
        {(showFilters || levelFilter !== "ALL") &&
          ["ALL", "ORG", "STATE", "CITY", "AREA", "OFFICE"].map((level) => (
            <button
              key={level}
              type="button"
              className={`chip ${levelFilter === level ? "sel" : ""}`}
              onClick={() => setLevelFilter(level)}
            >
              {level === "ALL" ? "All" : level}
              <span className="bdg b-gray" style={{ marginLeft: 4 }}>
                {levelCounts[level] || 0}
              </span>
            </button>
          ))}
        {(searchQuery || levelFilter !== "ALL") && (
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={() => {
              setSearchQuery("");
              setLevelFilter("ALL");
            }}
          >
            Clear
          </button>
        )}
      </div>

      {selectedBranch && breadcrumbs.length > 0 && !searchQuery && levelFilter === "ALL" && (
        <div className="br-breadcrumb">
          <button type="button" className="btn btn-ghost btn-xs" onClick={() => onSelect("")}>
            <ArrowLeft className="w-3.5 h-3.5" />
            Root
          </button>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <span key={crumb.id} className="flex items-center gap-1">
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                <button
                  type="button"
                  className={`btn btn-ghost btn-xs ${isLast ? "active" : ""}`}
                  onClick={() => !isLast && onSelect(String(crumb.id))}
                  disabled={isLast}
                >
                  {crumb.name}
                </button>
              </span>
            );
          })}
        </div>
      )}

      {selectedBranch && !searchQuery && levelFilter === "ALL" && (
        <div style={{ marginBottom: 10 }}>
          <BranchRow branch={selectedBranch} />
        </div>
      )}

      <h4 style={{ fontSize: 11, fontWeight: 700, color: "var(--br-mu)", marginBottom: 8, fontFamily: "var(--br-m)" }}>
        {listTitle} ({listBranches.length})
      </h4>

      <div style={{ maxHeight: 480, overflowY: "auto" }}>
        {listBranches.length > 0 ? (
          listBranches.map((branch) => <BranchRow key={branch.id} branch={branch} />)
        ) : (
          <div className="br-empty" style={{ padding: 24 }}>
            <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>No branches found</p>
          </div>
        )}
      </div>
    </div>
  );
};
