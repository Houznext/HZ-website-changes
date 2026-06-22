import Button from "@/src/common/Button";
import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const PaginationControls = React.memo(
  ({
    currentPage,
    totalPages,
    totalItems,
    onPageChange,
    pageSize,
    onPageSizeChange,
  }: {
    currentPage: number;
    totalPages: number;
    totalItems?: number;
    pageSize: number;
    onPageSizeChange: (size: number) => void;
    onPageChange: (page: number) => void;
  }) => {
    const itemTotal = totalItems ?? totalPages * pageSize;
    const rangeStart = itemTotal === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const rangeEnd = Math.min(currentPage * pageSize, itemTotal);

    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-[#eaeef2] pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-[12px] text-[#57606a]">Rows per page:</p>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="w-[58px] border border-[#d0d7de] rounded-lg px-2 py-1.5 font-medium text-[12px] bg-white text-[#24292f]"
          >
            {[5, 10, 15, 20].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-[12px] text-[#57606a]">
            {totalItems != null
              ? `Showing ${rangeStart}–${rangeEnd} of ${totalItems}`
              : `${currentPage} of ${totalPages}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-[#57606a] mr-1">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="bg-white border border-[#d0d7de] hover:bg-[#f6f8fa] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-[#24292f] text-[12px] px-3 py-2 rounded-lg font-semibold"
          >
            <FaChevronLeft className="text-[10px]" />
            Previous
          </Button>
          <Button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="bg-[#2f80ed] hover:bg-[#1a6dd6] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-[12px] text-white px-3 py-2 rounded-lg font-semibold"
          >
            Next
            <FaChevronRight className="text-[10px]" />
          </Button>
        </div>
      </div>
    );
  },
);

export default PaginationControls;
