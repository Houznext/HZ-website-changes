import React from "react";

interface LoaderProps {
  tagline?: string;
}

const Loader = ({ tagline }: LoaderProps) => {
  const text = tagline || "Please wait.";
  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[60vh] overflow-hidden px-4 py-2 bg-[#f5f7fa]">
      <div className="flex items-center justify-center">
        <div className="h-12 w-12 md:h-14 md:w-14 rounded-full border-4 border-[#d1e0f2] border-t-[#2f80ed] animate-spin shadow-sm" />
      </div>
      <p className="mt-3 text-xs md:text-sm font-medium text-slate-600 tracking-wide">
        {text}
      </p>
    </div>
  );
};

export default Loader;
