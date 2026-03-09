import React, { useState, useEffect, useRef } from "react";
import { Home, HardHat, Armchair, Sparkles } from "lucide-react";
import { FaChair } from "react-icons/fa";
const LOADER_ICONS = [
  { Icon: Home, label: "Properties" },
  { Icon: HardHat, label: "Construction" },
  { Icon: Armchair, label: "Interiors" },
  { Icon: Sparkles, label: "Home decor" },
  { Icon: FaChair, label: "Furniture" }
];

const SWAP_INTERVAL_MS = 1500;
const ROTATE_DURATION_MS = 350;

const DEFAULT_TAGLINE = "Finding your perfect space...";

interface LoaderProps {
  tagline?: string;
}

const Loader = ({ tagline = DEFAULT_TAGLINE }: LoaderProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [leavingIndex, setLeavingIndex] = useState<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((prev) => {
        setLeavingIndex(prev);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setLeavingIndex(null), ROTATE_DURATION_MS);
        return (prev + 1) % LOADER_ICONS.length;
      });
    }, SWAP_INTERVAL_MS);
    return () => {
      clearInterval(id);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const renderIcon = (index: number) => {
    const { Icon, label } = LOADER_ICONS[index];
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="relative p-3 rounded-xl  shadow-md shadow-[#3586FF]/10 ring-2 ring-[#3586FF]/10">
          <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/60 to-transparent pointer-events-none" />
          <Icon
            size={26}
            strokeWidth={1.75}
            className="relative w-5 h-5 md:w-7 md:h-7 text-[#3586FF]"
          />
        </div>
        <span className="text-[10px] md:text-xs font-semibold text-gray-600 uppercase tracking-widest whitespace-nowrap">
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full h-screen overflow-hidden px-4 py-2">
      <div className="relative flex justify-center items-center mb-3 h-[88px] w-[80px] md:h-[100px] md:w-[140px] overflow-hidden">
        <div key={activeIndex} className="absolute inset-0 flex flex-col items-center justify-center animate-icon-rotate-in">
          {renderIcon(activeIndex)}
        </div>
        {leavingIndex !== null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center animate-icon-rotate-out pointer-events-none">
            {renderIcon(leavingIndex)}
          </div>
        )}
      </div>
      <p className="mt-2 text-xs md:text-sm font-medium text-gray-500 tracking-wide animate-pulse">
        {tagline}
      </p>
    </div>
  );
};

export default Loader;
