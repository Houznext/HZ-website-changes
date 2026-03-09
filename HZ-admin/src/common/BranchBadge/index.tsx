import { MdLocationCity, MdRollerShades } from "react-icons/md";
import { ChevronDown } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { useState, useRef, useEffect } from "react";
import { usePermissionStore } from "@/src/stores/usePermissions";

type BranchRole = { id: string; roleName: string };

type BranchMembership = {
  branchId: string;
  branchName: string;
  level: "ORG" | "STATE" | "CITY" | "AREA" | "OFFICE" | "FRANCHISE" | string;
  isBranchHead: boolean;
  isPrimary: boolean;
  branchRoles: BranchRole[];
};

interface BranchBadgeProps {
  memberships?: BranchMembership[];
  className?: string;
}

const levelLabel: Record<string, string> = {
  ORG: "Head Office",
  STATE: "State Branch",
  CITY: "City Branch",
  AREA: "Area Branch",
  OFFICE: "Office",
  FRANCHISE: "Franchise",
};

export default function BranchBadge({
  memberships,
  className,
}: BranchBadgeProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { activeBranchId, switchBranch } = usePermissionStore();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!memberships || memberships.length === 0) return null;

  const active =
    memberships.find((m) => m.branchId === activeBranchId) ??
    memberships.find((m) => m.isPrimary) ??
    memberships[0];

  const roles = active.branchRoles?.map((r) => r.roleName).join(", ");
  const isOrg = active.level === "ORG";
  const label = levelLabel[active.level] ?? active.level;
  const hasMultiple = memberships.length > 1;

  const handleSwitch = (branchId: string) => {
    switchBranch(branchId);
    setOpen(false);
  };

  return (
    <div ref={dropdownRef} className={twMerge("relative flex items-center gap-1 flex-wrap", className)}>
      <button
        onClick={() => hasMultiple && setOpen(!open)}
        className={twMerge(
          "inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 md:px-3 py-[2px] text-nowrap md:text-xs font-medium text-[#3586FF] border border-sky-100 transition-colors",
          hasMultiple && "hover:bg-sky-100 cursor-pointer"
        )}
      >
        <span className="text-[11px] md:text-[10px]"><MdLocationCity /></span>
        <span className="sublabel-text">{active.branchName}</span>
        {!isOrg && label && (
          <span className="hidden sm:inline md:text-[10px] sm:text-[6px] text-sky-600">
            ({label})
          </span>
        )}
        {hasMultiple && <ChevronDown className="w-3 h-3 text-sky-500" />}
      </button>

      {roles && (
        <span className="hidden sm:inline-flex items-center rounded-full border font-medium border-gray-200 px-2 py-[2px] text-[11px] text-gray-600">
          <MdRollerShades /> {roles}
        </span>
      )}

      {active.isBranchHead && (
        <span className="hidden md:inline-flex items-center rounded-full bg-emerald-50 border border-emerald-100 px-2 py-[2px] text-[11px] font-medium text-emerald-700">
          Branch Head
        </span>
      )}

      {/* Branch selector dropdown */}
      {open && hasMultiple && (
        <div className="absolute top-full left-0 mt-1 z-50 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              Switch Branch
            </p>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {memberships.map((m) => (
              <button
                key={m.branchId}
                onClick={() => handleSwitch(m.branchId)}
                className={twMerge(
                  "w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-blue-50 flex items-center justify-between",
                  m.branchId === activeBranchId && "bg-blue-50 text-blue-700 font-medium"
                )}
              >
                <div>
                  <p className="font-medium text-[13px]">{m.branchName}</p>
                  <p className="text-[10px] text-gray-400">
                    {levelLabel[m.level] ?? m.level}
                    {m.isBranchHead && " · Branch Head"}
                  </p>
                </div>
                {m.branchId === activeBranchId && (
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
