import { useState, useRef, useEffect } from "react";
import { FiSearch, FiFilter, FiChevronDown, FiCheck, FiX } from "react-icons/fi";
import CustomInput from "@/src/common/FormElements/CustomInput";
import Button from "@/src/common/Button";
import { twMerge } from "tailwind-merge";
import SearchComponent from "../SearchSelect";

interface FilterOption {
  id: string | number;
  label: string;
}

interface GroupedFilter {
  groupLabel: string;
  key: string;
  options: FilterOption[];
}

type FilterConfig = (FilterOption | GroupedFilter)[];

interface FiltersState {
  [group: string]: any;
}

// 👇 matches SearchComponent's SearchOption
interface BranchOption {
  label: string;
  value: any;
}

interface ReusableSearchFilterProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  filters?: FilterConfig;
  selectedFilters?: FiltersState;
  onFilterChange?: React.Dispatch<React.SetStateAction<FiltersState>>;
  placeholder?: string;
  className?: string;
  rootCls?: string;

  /** 🔹 Optional Branch filter props */
  branchOptions?: BranchOption[]; // list of branches {label, value}
  selectedBranch?: any; // whatever you store (id or option)
  onBranchChange?: (val: any) => void; // called from SearchComponent

  showBranchFilter?: boolean;
}

const ReusableSearchFilter = ({
  searchText,
  onSearchChange,
  placeholder,
  filters,
  selectedFilters = {},
  onFilterChange,
  className,
  rootCls,
  branchOptions,
  selectedBranch,
  onBranchChange,
  showBranchFilter = false,
}: ReusableSearchFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const isGrouped = filters?.length > 0 && "groupLabel" in (filters?.[0] || {});
  const toggleGroup = (key: string) => {
    setExpandedGroup((prev) => (prev === key ? null : key));
  };

  const handleCheckboxChange = (
    groupOrId: string,
    optionIdOrChecked: string | number | boolean,
    checked?: boolean
  ) => {
    if (!onFilterChange) return; // ⬅️ safe when you use component without filters

    if (isGrouped) {
      // Handle grouped filters
      const groupKey = groupOrId;
      const optionId = optionIdOrChecked as string | number;
      const isChecked = checked as boolean;

      onFilterChange((prev) => ({
        ...prev,
        [groupKey]: {
          ...(prev?.[groupKey] || {}),
          [optionId]: isChecked,
        },
      }));
    } else {
      const filterId = groupOrId;
      const isChecked = optionIdOrChecked as boolean;

      onFilterChange((prev) => ({
        ...prev,
        [filterId]: isChecked,
      }));
    }
  };

  // Count active filters
  const activeFilterCount = Object.values(selectedFilters).reduce((count, group) => {
    if (typeof group === 'object') {
      return count + Object.values(group).filter(Boolean).length;
    }
    return count + (group ? 1 : 0);
  }, 0);

  // Close dropdown when clicking outside
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={twMerge(
        "flex items-center justify-center gap-3 w-full",
        rootCls
      )}
    >
      {/* Search Input */}
      <div className="relative flex-1">
        <CustomInput
          name="search"
          className={twMerge(className)}
          onChange={(e) => onSearchChange(e.target.value)}
          type="text"
          value={searchText}
          placeholder={placeholder}

          rightIcon={<FiSearch className="w-4 h-4 text-slate-400" />}
        />
      </div>

      {/* Filters Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          className={twMerge(
            "flex items-center gap-2 px-4 py-1.5 rounded-xl font-medium text-sm transition-all duration-200",
            isOpen
              ? "bg-blue-50 text-blue-600 border-2 border-blue-200 shadow-sm"
              : "bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50",
            activeFilterCount > 0 && "border-blue-200 bg-blue-50"
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <FiFilter className={twMerge("w-4 h-4", activeFilterCount > 0 ? "text-blue-500" : "text-slate-400")} />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center w-5 h-5 text-xs font-bold bg-blue-500 text-white rounded-full">
              {activeFilterCount}
            </span>
          )}
          <FiChevronDown className={twMerge("w-4 h-4 transition-transform duration-200", isOpen && "rotate-180")} />
        </button>

        {isOpen && (
          <div className="absolute right-0 md:w-[280px] w-[240px] mt-2 bg-white border border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl z-[99999999] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
              <span className="font-semibold text-slate-800 text-sm">Filter Options</span>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => onFilterChange && onFilterChange({})}
                  className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                >
                  <FiX className="w-3 h-3" />
                  Clear all
                </button>
              )}
            </div>

            {/* Filter Groups */}
            <div className="max-h-[320px] overflow-y-auto">
              {isGrouped ? (
                (filters as GroupedFilter[]).map((group, idx) => (
                  <div key={group.key} className={twMerge(idx > 0 && "border-t border-slate-100")}>
                    <button
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
                      onClick={() => toggleGroup(group.key)}
                    >
                      <span className="font-medium text-slate-700 text-sm">{group.groupLabel}</span>
                      <div className="flex items-center gap-2">
                        {Object.values(selectedFilters?.[group.key] || {}).filter(Boolean).length > 0 && (
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full font-medium">
                            {Object.values(selectedFilters?.[group.key] || {}).filter(Boolean).length}
                          </span>
                        )}
                        <FiChevronDown className={twMerge(
                          "w-4 h-4 text-slate-400 transition-transform duration-200",
                          expandedGroup === group.key && "rotate-180"
                        )} />
                      </div>
                    </button>

                    {expandedGroup === group.key && (
                      <div className="px-4 pb-3 space-y-1">
                        {group?.options?.map((option) => {
                          const isChecked = selectedFilters?.[group.key]?.[String(option?.id)] || false;
                          return (
                            <label
                              key={option.id}
                              className={twMerge(
                                "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                                isChecked ? "bg-blue-50" : "hover:bg-slate-50"
                              )}
                            >
                              <div className={twMerge(
                                "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                                isChecked
                                  ? "bg-blue-500 border-blue-500"
                                  : "border-slate-300 bg-white"
                              )}>
                                {isChecked && <FiCheck className="w-3 h-3 text-white" strokeWidth={3} />}
                              </div>
                              <span className={twMerge(
                                "text-sm",
                                isChecked ? "text-blue-700 font-medium" : "text-slate-600"
                              )}>
                                {option?.label}
                              </span>
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={isChecked}
                                onChange={(e) =>
                                  handleCheckboxChange(
                                    group.key,
                                    String(option.id),
                                    e.target.checked
                                  )
                                }
                              />
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              ) : Array.isArray(filters) && filters.length > 0 ? (
                <div className="p-3 space-y-1">
                  {(filters as FilterOption[]).map((filter) => {
                    const isChecked = selectedFilters[String(filter?.id)] || false;
                    return (
                      <label
                        key={filter?.id}
                        className={twMerge(
                          "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                          isChecked ? "bg-blue-50" : "hover:bg-slate-50"
                        )}
                      >
                        <div className={twMerge(
                          "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                          isChecked
                            ? "bg-blue-500 border-blue-500"
                            : "border-slate-300 bg-white"
                        )}>
                          {isChecked && <FiCheck className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                        <span className={twMerge(
                          "text-sm",
                          isChecked ? "text-blue-700 font-medium" : "text-slate-600"
                        )}>
                          {filter?.label}
                        </span>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={isChecked}
                          onChange={(e) =>
                            handleCheckboxChange(
                              String(filter?.id),
                              e.target.checked
                            )
                          }
                        />
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="px-4 py-8 text-center">
                  <p className="text-slate-400 text-sm">No filters available</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Branch Filter */}
      {showBranchFilter && (
        <div className="max-w-[120px] w-full md:max-w-[200px]">
          <SearchComponent
            placeholder="Select branch"
            value={
              branchOptions?.find((opt) => opt.value === selectedBranch)
                ?.label || ""
            }
            onChange={onBranchChange}
            inputClassName="text-sm placeholder:text-slate-400"
            dropdownCls="bg-white text-sm font-medium shadow-xl rounded-xl border border-slate-200"
            rootClassName="border-2 border-slate-200 rounded-xl bg-white py-1 px-3 hover:border-slate-300 transition-colors"
            options={branchOptions}
            isMulti={false}
            showDeleteIcon={true}
          />
        </div>
      )}
    </div>
  );
};

export default ReusableSearchFilter;
