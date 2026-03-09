import React, { ReactNode } from "react";

interface CustomTooltipProps {
  children: ReactNode;
  label: string;
  position?: "top" | "bottom" | "left" | "right";
  labelCls?: string;
  containerCls?: string;
  tooltipBg?: string; 
  tooltipTextColor?: string; 
   showTooltip?: boolean;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  children,
  label,
  position = "top",
  labelCls = "",
  containerCls = "",
  tooltipBg = "bg-black",
  tooltipTextColor = "text-white",
   showTooltip = true,
}) => {
  const basePosition = {
    top: "bottom-full mb-[10px] left-1/2 -translate-x-1/2",
    bottom: "top-full mt-[10px] left-1/2 -translate-x-1/2",
    left: "right-full mr-[10px] top-1/2 -translate-y-1/2",
    right: "left-full ml-[10px] top-1/2 -translate-y-1/2",
  };

  const arrowStyles = {
    top: "after:top-full after:left-1/2 after:-translate-x-1/2 after:border-t-[6px] after:border-t-black",
    bottom:
      "after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-b-[6px] after:border-b-black",
    left:
      "after:right-[-6px] after:top-1/2 after:-translate-y-1/2 after:border-l-[6px] after:border-l-black",
    right:
      "after:left-[-6px] after:top-1/2 after:-translate-y-1/2 after:border-r-[6px] after:border-r-black",
  };

  return (
    <div className={`relative group inline-block ${containerCls}`}>
      {children}
      {showTooltip && (
      <div
        className={`
          absolute z-50 whitespace-nowrap px-2 py-1 rounded-md text-xs font-medium opacity-0
          group-hover:opacity-100 transition-all duration-200
          ${tooltipBg} ${tooltipTextColor} ${labelCls}
          ${basePosition[position]}
          after:content-[''] after:absolute after:w-0 after:h-0 after:border-transparent after:border-solid
          ${arrowStyles[position]}
        `}
      >
        {label}
      </div> )}
    </div>
  );
};

export default CustomTooltip;
