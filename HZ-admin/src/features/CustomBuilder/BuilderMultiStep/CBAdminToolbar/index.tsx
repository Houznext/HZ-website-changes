import React from "react";
import {
  Download,
  LayoutGrid,
  List,
  Clock,
  Filter as FilterIcon,
  Search,
  Plus,
  ChevronDown,
} from "lucide-react";
import Button from "@/src/common/Button";

type ViewMode = "cards" | "list";
type SortKey = "recent" | "name" | "location" | "progress";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;

  onOpenFilters: () => void;
  filterCount?: number;

  onExport: () => void;

  viewMode: ViewMode;
  onChangeView: (v: ViewMode) => void;

  sortBy: SortKey;
  onChangeSort: (v: SortKey) => void;

  onAddCustomer: () => void;
}

const sortLabel: Record<SortKey, string> = {
  recent: "Recently Added",
  name: "Name (A–Z)",
  location: "Location",
  progress: "Progress",
};

const CBAdminToolbar: React.FC<Props> = ({
  search,
  onSearchChange,
  onOpenFilters,
  filterCount = 0,
  onExport,
  viewMode,
  onChangeView,
  sortBy,
  onChangeSort,
  onAddCustomer,
}) => {
  return (
    <div className="w-full">
      {/* Title row */}
      <div className="flex items-center justify-between gap-3 py-3 md:py-4">
        <h1 className="text-[18px] md:text-[22px] font-bold text-[#2F6EF7]">
          Custom Builders
        </h1>

        <div className="hidden md:flex items-center gap-8">
          <Button
            onClick={onExport}
            className="inline-flex items-center gap-2 border border-[#2F6EF7] text-[#2F6EF7] hover:bg-[#eef4ff] transition px-3 py-1.5 rounded-md font-medium"
          >
            <Download className="w-4 h-4" />
            Export Data
          </Button>

          <div className="flex items-center gap-2 font-medium">
            <span className="text-gray-600">View</span>
            <div className="inline-flex rounded-md overflow-hidden border border-gray-300">
              <Button
                onClick={() => onChangeView("cards")}
                className={`px-3 py-1.5 inline-flex items-center gap-2 ${
                  viewMode === "cards"
                    ? "bg-[#2F6EF7] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
                aria-pressed={viewMode === "cards"}
              >
                <LayoutGrid className="w-4 h-4" />
                Cards
              </Button>
              <Button
                onClick={() => onChangeView("list")}
                className={`px-3 py-1.5 inline-flex items-center gap-2 border-l border-gray-300 ${
                  viewMode === "list"
                    ? "bg-[#2F6EF7] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
                aria-pressed={viewMode === "list"}
              >
                <List className="w-4 h-4" />
                Compact
              </Button>
            </div>
          </div>

          <div className="relative">
            <Button className="inline-flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-md text-gray-700 font-medium">
              <Clock className="w-4 h-4" />
              <span>Sort by</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
            <div className="absolute mt-2 w-44 rounded-md border bg-white shadow-sm hidden md:group-hover:block" />
          </div>

          <select
            value={sortBy}
            onChange={(e) => onChangeSort(e.target.value as SortKey)}
            className="hidden md:block border border-gray-300 rounded-md px-2 py-1.5 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#2F6EF7]"
          >
            {Object.entries(sortLabel).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>

          <Button
            onClick={onAddCustomer}
            className="inline-flex items-center gap-2 bg-[#2F6EF7] text-white hover:bg-[#2a63db] transition px-3 py-1.5 rounded-md font-bold"
          >
            <Plus className="w-4 h-4" />
            New Customer
          </Button>
        </div>
      </div>

      <div className="flex w-full items-stretch gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, email, phone, property name or location"
            className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2F6EF7] placeholder:text-gray-400 font-medium"
          />
        </div>

        <Button
          onClick={onOpenFilters}
          className="hidden md:inline-flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 rounded-md text-gray-700 font-medium"
        >
          <FilterIcon className="w-4 h-4" />
          Filters
          {filterCount > 0 && (
            <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] text-[11px] rounded-full bg-[#2F6EF7] text-white">
              {filterCount}
            </span>
          )}
        </Button>

        <Button
          onClick={onAddCustomer}
          className="md:hidden inline-flex items-center justify-center bg-[#2F6EF7] text-white px-3 rounded-md"
          aria-label="New Customer"
          title="New Customer"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile actions row */}
      <div className="mt-2 grid grid-cols-3 gap-2 md:hidden">
        <Button
          onClick={onOpenFilters}
          className="inline-flex items-center justify-center gap-2 border border-gray-300 bg-white px-2 py-2 rounded-md text-gray-700 font-medium"
        >
          <FilterIcon className="w-4 h-4" />
          <span className="text-[12px]">Filters</span>
          {filterCount > 0 && (
            <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] text-[11px] rounded-full bg-[#2F6EF7] text-white">
              {filterCount}
            </span>
          )}
        </Button>

        <Button
          onClick={onExport}
          className="inline-flex items-center justify-center gap-2 border border-[#2F6EF7] text-[#2F6EF7] px-2 py-2 rounded-md font-medium"
        >
          <Download className="w-4 h-4" />
          <span className="text-[12px]">Export</span>
        </Button>

        <div className="inline-flex rounded-md overflow-hidden border border-gray-300">
          <Button
            onClick={() => onChangeView("cards")}
            className={`flex-1 py-2 inline-flex items-center justify-center ${
              viewMode === "cards"
                ? "bg-[#2F6EF7] text-white"
                : "bg-white text-gray-700"
            }`}
            aria-label="Cards view"
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => onChangeView("list")}
            className={`flex-1 py-2 inline-flex items-center justify-center border-l border-gray-300 ${
              viewMode === "list"
                ? "bg-[#2F6EF7] text-white"
                : "bg-white text-gray-700"
            }`}
            aria-label="List view"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>

        <div className="col-span-3">
          <div className="relative">
            <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={sortBy}
              onChange={(e) => onChangeSort(e.target.value as SortKey)}
              className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#2F6EF7]"
            >
              {Object.entries(sortLabel).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CBAdminToolbar;
