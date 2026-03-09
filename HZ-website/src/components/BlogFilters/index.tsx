import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import {
  HiOutlineSearch,
  HiX,
  HiOutlineFilter,
  HiOutlineSortDescending,
  HiOutlineSortAscending,
  HiChevronDown,
  HiOutlineSparkles,
  HiOutlineTrendingUp,
  HiOutlineCollection
} from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/common/Button";

// Blog Types organized by category
const BLOG_TYPE_CATEGORIES = {
  "Construction": [
    "Residential construction",
    "Construction for business",
    "Custom builder",
    "CivilEngineering",
  ],
  "Home & Living": [
    "Furniture",
    "Interiors",
    "HomeDecors",
    "Paints",
  ],
  "Services": [
    "Plumbing",
    "Electronics",
    "Solar",
    "EarthMover",
  ],
  "Other": [
    "VaastuConsultation",
    "General",
  ],
};

// All blog types flattened
const ALL_BLOG_TYPES = Object.values(BLOG_TYPE_CATEGORIES).flat();

// Blog status options
const BLOG_STATUS_OPTIONS = [
  { value: "", label: "All", icon: HiOutlineCollection },
  { value: "Featured", label: "Featured", icon: HiOutlineSparkles },
  { value: "Trending", label: "Trending", icon: HiOutlineTrendingUp },
  { value: "Regular", label: "Regular", icon: HiOutlineCollection },
];

// Sort options
const SORT_OPTIONS = [
  { value: "createdAt-DESC", label: "Newest First" },
  { value: "createdAt-ASC", label: "Oldest First" },
  { value: "title-ASC", label: "Title A-Z" },
  { value: "title-DESC", label: "Title Z-A" },
];

interface BlogFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedTypes: string[];
  onTypeChange: (types: string[]) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  sortBy: string;
  sortOrder: string;
  onSortChange: (sortBy: string, sortOrder: string) => void;
  totalResults: number;
  isLoading?: boolean;
}

const BlogFilters: React.FC<BlogFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedTypes,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  sortOrder,
  onSortChange,
  totalResults,
  isLoading = false,
}) => {
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTypeToggle = useCallback((type: string) => {
    if (selectedTypes.includes(type)) {
      onTypeChange(selectedTypes.filter(t => t !== type));
    } else {
      onTypeChange([...selectedTypes, type]);
    }
  }, [selectedTypes, onTypeChange]);

  const handleClearAllFilters = useCallback(() => {
    onSearchChange("");
    onTypeChange([]);
    onStatusChange("");
    onSortChange("createdAt", "DESC");
  }, [onSearchChange, onTypeChange, onStatusChange, onSortChange]);

  const handleSortSelect = useCallback((value: string) => {
    const [field, order] = value.split("-");
    onSortChange(field, order);
    setIsSortDropdownOpen(false);
  }, [onSortChange]);

  const hasActiveFilters = useMemo(() => {
    return searchTerm || selectedTypes.length > 0 || selectedStatus;
  }, [searchTerm, selectedTypes, selectedStatus]);

  const currentSortLabel = useMemo(() => {
    const currentSort = `${sortBy}-${sortOrder}`;
    return SORT_OPTIONS.find(opt => opt.value === currentSort)?.label || "Newest First";
  }, [sortBy, sortOrder]);

  // Render the filter chip for active filters
  const renderActiveFilterChip = (label: string, onRemove: () => void) => (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-[#3586FF]/10 text-[#3586FF] rounded-full text-xs md:text-sm font-medium border border-[#3586FF]/20 hover:bg-[#3586FF]/20 transition-colors"
    >
      <span className="max-w-[100px] md:max-w-none truncate">{label}</span>
      <Button
        onClick={onRemove}
        className="p-0.5 hover:bg-[#3586FF]/30 rounded-full transition-colors flex-shrink-0"
        aria-label={`Remove ${label} filter`}
      >
        <HiX className="w-3 h-3 md:w-3.5 md:h-3.5" />
      </Button>
    </motion.span>
  );

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100">
        <div className="p-3 md:p-6 bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-t-xl md:rounded-t-2xl">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-stretch sm:items-center">
            <div className="relative flex-1 w-full sm:max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                <HiOutlineSearch className={clsx(
                  "h-4 w-4 transition-colors duration-200",
                  searchTerm ? "text-[#3586FF]" : "text-gray-400"
                )} />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className={clsx(
                  "w-full pl-9 md:pl-11 pr-8 py-1 md:py-2.5 bg-white border rounded-lg md:rounded-xl text-sm text-gray-900 placeholder:text-[13px] md:placeholder:text-[14px] placeholder-gray-400",
                  "focus:outline-none focus:ring-0 transition-all duration-200",
                  searchTerm
                    ? "border-[#3586FF] shadow-md shadow-[#3586FF]/20"
                    : "border-gray-200 hover:border-gray-300 focus:border-[#3586FF]"
                )}
              />
              <AnimatePresence>
                {searchTerm && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => onSearchChange("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    aria-label="Clear search"
                  >
                    <span className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                      <HiX className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              {/* Category Dropdown */}
              <div className="relative" ref={typeDropdownRef}>
                <Button
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                  className={clsx(
                    "inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1 md:py-2.5 rounded-lg md:rounded-xl font-medium text-xs md:text-sm transition-all duration-200",
                    selectedTypes.length > 0
                      ? "bg-[#3586FF] text-white shadow-md shadow-[#3586FF]/30 hover:bg-[#2A6FD6]"
                      : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <HiOutlineFilter className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="hidden sm:inline">Categories</span>
                  {selectedTypes.length > 0 && (
                    <span className="bg-white/20 px-1.5 md:px-2 py-0.5 rounded-full text-[10px] md:text-xs">
                      {selectedTypes.length}
                    </span>
                  )}
                  <HiChevronDown className={clsx(
                    "h-3.5 w-3.5 md:h-4 md:w-4 transition-transform duration-200",
                    isTypeDropdownOpen && "rotate-180"
                  )} />
                </Button>

                <AnimatePresence>
                  {isTypeDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 sm:right-0 mt-2 w-[280px] md:w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-[100] max-h-[70vh] overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900">Filter by Category</span>
                          {selectedTypes.length > 0 && (
                            <Button
                              onClick={() => onTypeChange([])}
                              className="text-sm text-[#3586FF] hover:text-[#2A6FD6] font-medium"
                            >
                              Clear all
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto p-2">
                        {Object.entries(BLOG_TYPE_CATEGORIES).map(([category, types]) => (
                          <div key={category} className="mb-3 last:mb-0">
                            <p className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              {category}
                            </p>
                            <div className="space-y-0.5">
                              {types.map((type) => (
                                <Button
                                  key={type}
                                  onClick={() => handleTypeToggle(type)}
                                  className={clsx(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                                    selectedTypes.includes(type)
                                      ? "bg-[#3586FF]/10 text-[#3586FF] font-medium"
                                      : "text-gray-700 hover:bg-gray-50"
                                  )}
                                >
                                  <span className={clsx(
                                    "w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-150",
                                    selectedTypes.includes(type)
                                      ? "bg-[#3586FF] border-[#3586FF]"
                                      : "border-gray-300"
                                  )}>
                                    {selectedTypes.includes(type) && (
                                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                                        <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                                      </svg>
                                    )}
                                  </span>
                                  {type}
                                </Button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sort Dropdown */}
              <div className="relative" ref={sortDropdownRef}>
                <Button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1 md:py-2.5 bg-white border border-gray-200 rounded-lg md:rounded-xl text-gray-700 font-medium text-xs md:text-sm hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  {sortOrder === "ASC" ? (
                    <HiOutlineSortAscending className="h-4 w-4 md:h-5 md:w-5" />
                  ) : (
                    <HiOutlineSortDescending className="h-4 w-4 md:h-5 md:w-5" />
                  )}
                  <span className="hidden sm:inline">{currentSortLabel}</span>
                  <HiChevronDown className={clsx(
                    "h-3.5 w-3.5 md:h-4 md:w-4 transition-transform duration-200",
                    isSortDropdownOpen && "rotate-180"
                  )} />
                </Button>

                <AnimatePresence>
                  {isSortDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-40 md:w-48 bg-white rounded-lg md:rounded-xl shadow-xl border border-gray-200 z-[100]"
                    >
                      <div className="p-1.5 md:p-2">
                        {SORT_OPTIONS.map((option) => (
                          <Button
                            key={option.value}
                            onClick={() => handleSortSelect(option.value)}
                            className={clsx(
                              "w-full px-3 py-2 md:py-2.5 text-xs md:text-sm text-left rounded-lg transition-all duration-150",
                              `${sortBy}-${sortOrder}` === option.value
                                ? "bg-[#3586FF]/10 text-[#3586FF] font-medium"
                                : "text-gray-700 hover:bg-gray-50"
                            )}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="px-3 md:px-6 py-2 md:py-3 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {BLOG_STATUS_OPTIONS.map((option) => {
              const IconComponent = option.icon;
              const isActive = selectedStatus === option.value;
              return (
                <Button
                  key={option.value}
                  onClick={() => onStatusChange(option.value)}
                  className={clsx(
                    "inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-200",
                    isActive
                      ? "text-white shadow-md shadow-[#3586FF]/30"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                  style={isActive ? { background: "linear-gradient(to right, #5CA0FF, #3586FF, #2A6FD6)" } : {}}
                >
                  <IconComponent className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  {option.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Active Filters & Results Count */}
        <AnimatePresence>
          {(hasActiveFilters || totalResults > 0) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-3 md:px-6 py-2 md:py-3 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-b-xl md:rounded-b-2xl"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 md:gap-3">
                <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                  {/* Results count */}
                  <span className="text-xs md:text-sm text-gray-600">
                    {isLoading ? (
                      <span className="inline-flex items-center gap-1.5 md:gap-2">
                        <span className="w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-[#3586FF] border-t-transparent rounded-full animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      <>
                        <span className="font-semibold text-gray-900">{totalResults}</span> blogs found
                      </>
                    )}
                  </span>

                  {/* Divider */}
                  {hasActiveFilters && (
                    <span className="w-px h-5 bg-gray-300 mx-2 hidden sm:block" />
                  )}

                  {/* Active filter chips */}
                  <AnimatePresence mode="popLayout">
                    {searchTerm && renderActiveFilterChip(
                      `"${searchTerm}"`,
                      () => onSearchChange("")
                    )}
                    {selectedTypes.map((type) => (
                      <span key={type}>
                        {renderActiveFilterChip(type, () =>
                          onTypeChange(selectedTypes.filter(t => t !== type))
                        )}
                      </span>
                    ))}
                    {selectedStatus && renderActiveFilterChip(
                      selectedStatus,
                      () => onStatusChange("")
                    )}
                  </AnimatePresence>
                </div>

                {/* Clear all Button */}
                {hasActiveFilters && (
                  <Button
                    onClick={handleClearAllFilters}
                    className="text-xs md:text-sm font-medium text-red-600 hover:text-red-700 hover:underline transition-colors whitespace-nowrap"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed right-0 top-0 h-full w-80 max-w-full bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <Button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <HiX className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Categories</h4>
                {Object.entries(BLOG_TYPE_CATEGORIES).map(([category, types]) => (
                  <div key={category} className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {category}
                    </p>
                    <div className="space-y-1">
                      {types.map((type) => (
                        <Button
                          key={type}
                          onClick={() => handleTypeToggle(type)}
                          className={clsx(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                            selectedTypes.includes(type)
                              ? "bg-[#3586FF]/10 text-[#3586FF] font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          )}
                        >
                          <span className={clsx(
                            "w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-150",
                            selectedTypes.includes(type)
                              ? "bg-[#3586FF] border-[#3586FF]"
                              : "border-gray-300"
                          )}>
                            {selectedTypes.includes(type) && (
                              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                                <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                              </svg>
                            )}
                          </span>
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <Button
                  onClick={() => {
                    handleClearAllFilters();
                    setIsMobileFilterOpen(false);
                  }}
                  className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                >
                  Clear all
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlogFilters;
