import React from "react";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import Button from "../Button";

type QuantitySelectorProps = {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
};

const QuantitySelector = ({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  max,
}: QuantitySelectorProps) => {
  const qty = Math.floor(quantity);
  const canDecrease = qty > min;
  const canIncrease = max == null || qty < max;

  return (
    <div
      className="inline-flex items-stretch  overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] select-none"
      role="group"
      aria-label="Quantity"
    >
      <Button
        type="button"
        onClick={onDecrease}
        disabled={!canDecrease}
        aria-label="Decrease quantity"
        className={`flex h-8 w-8 items-center justify-center rounded-l-[10px] border-0 transition-all md:h-8 md:w-8 ${
          canDecrease
            ? "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] active:scale-[0.97] disabled:opacity-100"
            : "cursor-not-allowed bg-white text-[#CBD5E1]"
        }`}
      >
        <AiOutlineMinus size={16} color="#475569" className="shrink-0" strokeWidth={2.5} />
      </Button>

      <div
        className="flex min-w-[1rem] items-center justify-center border-x border-[#E2E8F0] bg-[#FAFBFC] px-1 text-[14px] font-semibold text-[#0F172A] md:min-w-[3rem] md:text-[15px]"
        aria-live="polite"
        aria-atomic="true"
      >
        {qty}
      </div>

      <Button
        type="button"
        onClick={onIncrease}
        disabled={!canIncrease}
        aria-label="Increase quantity"
        className={`flex h-9 w-10 items-center justify-center rounded-r-[10px] border-0 transition-all md:h-8 md:w-8 ${
          canIncrease
            ? "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] active:scale-[0.97] disabled:opacity-100"
            : "cursor-not-allowed bg-white text-[#CBD5E1]"
        }`}
      >
        <AiOutlinePlus size={16} color="#475569" className="shrink-0" strokeWidth={2.5} />
      </Button>
    </div>
  );
};

export default QuantitySelector;
