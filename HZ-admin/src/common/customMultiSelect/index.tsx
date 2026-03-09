import React, { useEffect, useRef, useState } from "react";

interface Option {
  id: number | string;
  name: string;
}

interface CustomMultiSelectProps {
  label: string;
  options: Option[];
  selectedOptions: Option[];
  onChange: (selected: Option[]) => void;
  errorMsg?: string;
}

const CustomMultiSelect: React.FC<CustomMultiSelectProps> = ({
  label,
  options,
  selectedOptions,
  onChange,
  errorMsg
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (option: Option) => {
    const isSelected = selectedOptions.some((selected) => selected.id === option.id);
    const updatedSelection = isSelected
      ? selectedOptions.filter((selected) => selected.id !== option.id)
      : [...selectedOptions, option];
    onChange(updatedSelection);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full lg:w-[600px]">
      <label className="block mb-2 text-[16px] font-medium">{label}</label>

      <div
        className="border border-gray-300 h-[48px] rounded-[8px] flex items-center px-4 cursor-pointer"
        onClick={() => setDropdownOpen((prev) => !prev)}
      >
        {selectedOptions?.length > 0 ? (
          <div className="flex gap-2 flex-wrap">
            {selectedOptions.map((option) => (
              <span
                key={option.id}
                className="bg-blue-100 text-[#3586FF]  px-2 py-1 rounded-[4px] text-sm flex items-center gap-2"
              >
                {option.name}
                <button
                  className="text-red-600 font-bold"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(option);
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-400">Select options...</span>
        )}
        <span className="ml-auto text-gray-600">{dropdownOpen ? "▲" : "▼"}</span>
      </div>

      {dropdownOpen && (
        <div className="absolute mt-1 border border-gray-300 bg-white shadow-md rounded-[8px] max-h-[200px] overflow-y-auto w-full z-10">
          {options.map((option) => (
            <div
              key={option.id}
              className={`px-4 py-2 hover:bg-blue-100 cursor-pointer ${selectedOptions.some((selected) => selected.id === option.id) ? "bg-blue-50" : ""
                }`}
              onClick={() => handleSelect(option)}
            >
              {option.name}
            </div>
          ))}
        </div>
      )}
      {errorMsg && <p className="text-red-600 text-xs mt-2">{errorMsg}</p>}
    </div>
  );
};

export default CustomMultiSelect;
