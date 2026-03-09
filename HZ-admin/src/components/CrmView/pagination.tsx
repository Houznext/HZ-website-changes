import Button from "@/src/common/Button";
import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const PaginationControls = React.memo(
  ({
    currentPage,
    totalPages,
    onPageChange,
    pageSize,
    onPageSizeChange,
  }: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    onPageSizeChange: (size: number) => void;
    onPageChange: (page: number) => void;
  }) => (
    <div className="mt-4 flex gap-2 items-center">
      <p className="font-medium md:text-[12px] text-[10px] text-nowrap">
        Rows Per Page :
      </p>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="w-[55px] p-2 px-1.5 py-1 border border-gray-300 rounded font-medium text-[12px] md:text-[12px]"
      >
        {[5, 10, 15, 20].map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>

      <span className="text-nowrap font-medium text-[12px] md:text-[13px]">
        {currentPage}-{totalPages} of {totalPages}
      </span>
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="bg-gray-400 flex items-center gap-1 text-white text-[12px] md:text-[14px] px-3 py-2 rounded-md font-medium"
      >
        <FaChevronLeft />
        {/* Previous */}
      </Button>
      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="bg-[#5297FF] hover:bg-[#5297ff] flex items-center gap-1 text-[12px] md:text-[14px] text-white px-3 py-2 rounded-md font-medium"
      >
        {/* Next */}
        <FaChevronRight />
      </Button>
    </div>
  )
);

export default PaginationControls;
