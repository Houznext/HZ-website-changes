"use client";

import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { IoIosArrowDown } from "react-icons/io";
import { FiCheck } from "react-icons/fi";

export interface StatusOption {
  value: string;
  label: string;
  colorClass: string;
}

export interface StatusGroup {
  label: string;
  options: StatusOption[];
}

interface StatusDropdownProps {
  value: string;
  options: StatusOption[];
  groups?: StatusGroup[];
  onChange: (value: string) => void;
  placeholder?: string;
  variant?: "compact" | "full";
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

/** z-index high enough to appear above modals and overlays */
const DROPDOWN_Z = 99999;

export default function StatusDropdown({
  value,
  options,
  groups,
  onChange,
  placeholder = "Select status",
  variant = "compact",
  disabled = false,
  onClick,
}: StatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const displayOptions = groups || [{ label: "Options", options }];
  const currentColor = options.find((o) => o.value === value)?.colorClass || "bg-gray-100 text-gray-700";

  useEffect(() => {
    if (!open || !buttonRef.current) return;

    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 4,
          left: rect.right - 220,
          width: 220,
        });
      }
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onOutside = (e: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        const portal = document.getElementById("status-dropdown-portal");
        if (portal && !portal.contains(e.target as Node)) {
          setOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  const handleSelect = (opt: StatusOption) => {
    onChange(opt.value);
    setOpen(false);
  };

  const dropdownContent = open && typeof document !== "undefined" && (
    <div
      id="status-dropdown-portal"
      className="fixed rounded-xl border border-gray-200 bg-white py-1 shadow-xl ring-1 ring-black/5 max-h-72 overflow-auto"
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
        zIndex: DROPDOWN_Z,
      }}
    >
      {displayOptions.map((group) => (
        <div key={group.label}>
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 bg-gray-50">
            {group.label}
          </div>
          {group.options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt)}
              className={`relative w-full cursor-pointer select-none py-2 pl-3 pr-9 text-left hover:bg-blue-50 ${
                value === opt.value ? "bg-blue-50" : ""
              }`}
            >
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${opt.colorClass}`}
              >
                {opt.label}
              </span>
              {value === opt.value && (
                <span className="absolute inset-y-0 right-3 flex items-center">
                  <FiCheck className="h-4 w-4 text-blue-600" />
                </span>
              )}
            </button>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative" onClick={onClick}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`
          relative w-full flex items-center justify-between gap-2 rounded-lg border border-gray-200
          bg-white shadow-sm transition-all hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
          ${variant === "compact" ? "px-2 py-1.5 text-[10px] md:text-[11px]" : "px-3 py-2 text-sm"}
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-medium ${currentColor}`}>
          {value || placeholder}
        </span>
        <IoIosArrowDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(dropdownContent, document.body)}
    </div>
  );
}
