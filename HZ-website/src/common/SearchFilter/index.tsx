import { useMemo, useState } from "react";
import { FiSearch, FiFilter } from "react-icons/fi";
import { twMerge } from "tailwind-merge";
import CustomInput from "../FormElements/CustomInput";
import Button from "../Button";

/** ===== Types ===== */
interface FilterOption {
    id: string | number;
    label: string;
}
interface GroupedFilter {
    groupLabel: string;
    key: string;
    options: FilterOption[];
}
type FilterConfig = Array<FilterOption | GroupedFilter>;

type FiltersState =
    | {
        [groupKey: string]: Record<string, boolean>;
    }
    | {
        [filterId: string]: boolean;
    };

interface ReusableSearchFilterProps {
    searchText: string;
    onSearchChange: (value: string) => void;
    filters?: FilterConfig;
    selectedFilters?: FiltersState;
    onFilterChange?: React.Dispatch<React.SetStateAction<FiltersState>>;
    placeholder?: string;
    className?: string;
    rootCls?: string;
}

/** ===== Component ===== */
const ReusableSearchFilter = ({
    searchText,
    onSearchChange,
    placeholder = "Search...",
    filters = [],
    selectedFilters,
    onFilterChange,
    className,
    rootCls,
}: ReusableSearchFilterProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

    // Safe defaults when parent doesn’t pass these props
    const selectedSafe = useMemo<FiltersState>(() => selectedFilters ?? ({} as FiltersState), [selectedFilters]);
    const setFiltersSafe =
        onFilterChange ??
        (() => {
            /* no-op if parent didn't pass */
        });

    // Detect grouped vs flat safely
    const isGrouped = useMemo(() => {
        if (!Array.isArray(filters) || filters.length === 0) return false;
        const first = filters[0] as GroupedFilter;
        return typeof (first as any)?.groupLabel === "string" && typeof first?.key === "string" && Array.isArray(first?.options);
    }, [filters]);

    const toggleGroup = (key: string) => {
        setExpandedGroup((prev) => (prev === key ? null : key));
    };

    const handleCheckboxChange = (
        groupOrId: string,
        optionIdOrChecked: string | number | boolean,
        checked?: boolean
    ) => {
        if (isGrouped) {
            const groupKey = groupOrId;
            const optionId = String(optionIdOrChecked as string | number);
            const isChecked = Boolean(checked);

            setFiltersSafe((prev) => {
                const prevObj = (prev as any) ?? {};
                const group = (prevObj[groupKey] as Record<string, boolean>) ?? {};
                return {
                    ...prevObj,
                    [groupKey]: {
                        ...group,
                        [optionId]: isChecked,
                    },
                } as FiltersState;
            });
        } else {
            const filterId = String(groupOrId);
            const isChecked = Boolean(optionIdOrChecked);

            setFiltersSafe((prev) => {
                const prevObj = (prev as any) ?? {};
                return {
                    ...prevObj,
                    [filterId]: isChecked,
                } as FiltersState;
            });
        }
    };

    return (
        <div className={twMerge("flex items-center justify-center md:gap-4 gap-2   w-full", rootCls)}>
            {/* Search */}
            <div className="relative w-full">
                <CustomInput
                    name="search"
                    labelCls="md:text-[16px] text-[12px] font-medium"
                    className={twMerge("md:px-[4px] px-[3px] md:rounded-[8px] rounded-[4px]", className)}
                    outerInptCls={twMerge(className, "py-[0px] md:py-[4px]")}
                    onChange={(e) => onSearchChange(e.target.value)}
                    type="text"
                    value={searchText}
                    placeholder={placeholder}
                    rightIcon={<FiSearch className="md:text-[16px] text-[14px]" />}
                />
            </div>

            {/* Filters button + dropdown */}
            <div className="relative">
                <Button
                    className="flex items-center gap-2 bg-white border font-medium border-gray-300 md:text-[16px] text-[12px] md:py-[6px] py-[5px] md:px-4 px-2 rounded-lg focus:outline-none"
                    onClick={() => setIsOpen((p) => !p)}
                >
                    <FiFilter className="text-gray-500" size={14} />
                    <span className="text-gray-700 font-medium md:text-[13px] text-[10px]">Filters</span>
                </Button>

                {isOpen && (
                    <div className="absolute right-0 md:w-[260px] w-[180px] mt-1 bg-white border border-gray-300 shadow-lg rounded-lg z-10 text-[12px] md:text-[14px] max-h-[300px] overflow-auto">
                        <ul className="py-2">
                            {isGrouped
                                ? (filters as GroupedFilter[]).map((group) => (
                                    <li key={group.key} className="border-b px-3 py-2">
                                        <div
                                            className="font-bold cursor-pointer text-[#3586FF]"
                                            onClick={() => toggleGroup(group.key)}
                                        >
                                            {group.groupLabel}
                                        </div>

                                        {expandedGroup === group.key && (
                                            <ul className="mt-2 space-y-1">
                                                {group.options?.map((option) => {
                                                    const groupState = (selectedSafe as any)[group.key] as Record<string, boolean> | undefined;
                                                    const checked = Boolean(groupState?.[String(option.id)]);
                                                    return (
                                                        <li key={option.id} className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={(e) => handleCheckboxChange(group.key, String(option.id), e.target.checked)}
                                                            />
                                                            {option.label}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </li>
                                ))
                                : (filters as FilterOption[]).map((filter) => {
                                    const checked = Boolean((selectedSafe as any)[String(filter.id)]);
                                    return (
                                        <li key={filter.id} className="flex items-center gap-2 px-3 py-2">
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={(e) => handleCheckboxChange(String(filter.id), e.target.checked)}
                                            />
                                            {filter.label}
                                        </li>
                                    );
                                })}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReusableSearchFilter;
