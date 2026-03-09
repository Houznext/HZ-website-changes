import React, { useEffect, useState, useRef } from "react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import {
  Close as DeleteIcon,
  ArrowDropDown as DropdownIcon,
} from "@mui/icons-material";
import { SearchIcon } from "lucide-react";

interface SearchOption {
  label: string;
  value: any;
}

interface SearchComponentProps {
  label?: string;
  labelCls?: string;
  placeholder?: string;
  name?: string;
  value?: string | number | any[];
  required?: boolean;
  onChange?: (val: any) => void;
  onReset?: () => void;
  rootClassName?: string;
  inputClassName?: string;
  iconClassName?: string;
  dropdownIconClassName?: string;
  errorMsg?: string;
  errorCls?: string;
  options?: SearchOption[];
  dropdownCls?: string;
  showDeleteIcon?: boolean;
  isMulti?: boolean;
}

const SearchComponent: React.FC<SearchComponentProps> = ({
  label,
  labelCls,
  name,
  placeholder = "Search...",
  value = "",
  onChange,
  onReset,
  rootClassName,
  inputClassName,
  iconClassName,
  dropdownIconClassName,
  errorMsg,
  required,
  errorCls,
  options = [],
  dropdownCls,
  showDeleteIcon = true,
  isMulti = false,
}) => {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const wrapperRef = useRef(null);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClickOutside = (event: MouseEvent) => {
    if (wrapperRef.current && !(wrapperRef.current as any).contains(event.target)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    if (!isMulti) {
      if (value !== undefined && value !== null && value !== "") {
        const option = options.find((opt) => opt.value === value);
        setSearch(option ? option.label : String(value));
      } else {
        setSearch("");
      }
    } else {
      setSearch("");
    }
  }, [value, isMulti, options]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearch(newValue);
    const filtered = options.filter((option) =>
      option.label.toLowerCase().includes(newValue.toLowerCase())
    );
    setFilteredOptions(filtered);
    setShowDropdown(true);
  };

  const isSelected = (val: any) => {
    return isMulti ? (value as any[])?.includes(val) : value === val;
  };

  const toggleSelect = (option: SearchOption) => {
    if (isMulti) {
      const currentValues = (value as any[]) || [];
      const exists = currentValues.includes(option.value);
      const newValues = exists
        ? currentValues.filter((v) => v !== option.value)
        : [...currentValues, option.value];
      onChange && onChange(newValues);
    } else {
      setSearch(option.label);
      onChange && onChange(option);
      setShowDropdown(false);
    }
  };

  const handleReset = () => {
    if (isMulti) {
      onChange && onChange([]);
    } else {
      setSearch("");
      onChange && onChange({ label: '', value: "" });
    }
    onReset && onReset();
    setFilteredOptions(options);
  };

  const displayLabel = () => {
    if (isMulti) {
      return options
        .filter((opt) => (value as any[])?.includes(opt.value))
        .map((opt) => opt.label)
        .join(", ");
    }
    return search;
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {label && (
        <label
          className={twMerge(
            clsx("block text-sm font-medium text-gray-700 mb-1", labelCls)
          )}
        >
          {label}
          {required && <sup className="text-red-500">*</sup>}
        </label>
      )}
      <div
        className={twMerge(
          clsx(
            "flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400",
            rootClassName,
            {
              '!border-red-400 !focus:border-red-400': !!errorMsg?.trim(),
            }
          )
        )}
      >
        {(value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) ? (
          <span className="text-gray-400">
            <SearchIcon size={14} />
          </span>
        ) : null}
        <input
          type="text"
          value={displayLabel()}
          name={name}
          required={required}
          onChange={handleChange}
          placeholder={placeholder}
          onFocus={() => setShowDropdown(true)}
          className={twMerge(
            clsx(
              "flex-1 outline-none border-none bg-transparent text-[12px] md:text-[14px] text-gray-800 placeholder-gray-00",
              inputClassName
            )
          )}
        />
        {showDeleteIcon && ((isMulti && (value as any[])?.length) || (!isMulti && (value !== null && value !== undefined && value !== ""))) && (
          <DeleteIcon
            className={twMerge(
              clsx(
                "text-gray-400 cursor-pointer hover:text-gray-600",
                iconClassName
              )
            )}
            onClick={handleReset}
          />
        )}
        <DropdownIcon
          onClick={() => setShowDropdown(!showDropdown)}
          className={twMerge(
            clsx(
              "text-gray-400 cursor-pointer hover:text-gray-600",
              dropdownIconClassName
            )
          )}
        />
      </div>

      {showDropdown && filteredOptions.length > 0 && (
        <ul
          className={twMerge(
            clsx(
              "absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto custom-scrollbar shadow-lg text-[14px] font-regular",
              dropdownCls
            )
          )}
        >
          {filteredOptions.map((option) => (
            <li
              key={option.value}
              onClick={() => toggleSelect(option)}
              className="px-3 py-1 cursor-pointer border-b-[1px] font-regular border-gray-300 md:text-[13px] text-[12px] text-black hover:bg-gray-200 flex items-center gap-2"
            >
              {isMulti && (
                <input
                  type="checkbox"
                  checked={isSelected(option.value)}
                  readOnly
                />
              )}
              {option.label}
            </li>
          ))}
        </ul>
      )}

      {errorMsg && (
        <p
          className={twMerge(
            clsx("text-red-400 text-xs mt-1 font-medium", errorCls)
          )}
        >
          {errorMsg}
        </p>
      )}
    </div>
  );
};

export default SearchComponent;