import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import { IoIosArrowDown } from "react-icons/io";
import { FiCheck } from "react-icons/fi";

export interface ISingleSelectProps {
  type: "single-select";
  name: string;
  label?: string;
  labelCls?: string;
  errorMsg?: string;
  errorCls?: string;
  note?: string;
  noteCls?: string;
  buttonCls?: string;
  optionCls?: string;
  rootCls?: string;
  selectedOptionCls?: string;
  openButtonCls?: string;
  id?: string;
  optionsInterface: { isObj: boolean; displayKey?: string };
  options: Array<any>;
  selectedOption: any;
  required?: boolean;
  handleChange?: (name: string, value: any) => void;

  placeholder?: string;
  placeholderCls?: string;
}

export default function SingleSelect(props: ISingleSelectProps) {
  const {
    name,
    optionsInterface,
    options,
    selectedOption,
    handleChange,
    label,
    labelCls,
    id,
    rootCls,
    openButtonCls,
    buttonCls,
    errorCls,
    errorMsg,
    note,
    noteCls,
    optionCls,
    selectedOptionCls,
    required,
    placeholder,
    placeholderCls,
  } = props;

  const hasValue = optionsInterface.isObj
    ? !!(
        selectedOption &&
        optionsInterface.displayKey &&
        selectedOption[optionsInterface.displayKey!]?.toString().trim()
      )
    : selectedOption !== undefined &&
      selectedOption !== null &&
      selectedOption?.toString().trim().length > 0;

  const displayText = optionsInterface.isObj
    ? hasValue
      ? selectedOption[optionsInterface.displayKey!]
      : placeholder ?? "Select an option"
    : hasValue
    ? selectedOption
    : placeholder ?? "Select an option";

  const hasError = !!errorMsg && errorMsg.trim().length > 0;

  return (
    <div className="w-full">
      {label && label.trim().length > 0 && (
        <label
          htmlFor={id}
          className={twMerge(
            clsx({
              "mb-1.5 inline-block text-[13px] font-semibold text-slate-700 tracking-wide": true,
              "cursor-pointer": id,
            }),
            labelCls
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <Listbox
        value={selectedOption}
        onChange={(value) => {
          handleChange && handleChange(name, value);
        }}
      >
        {({ open }) => (
         <div
    className={twMerge(
      clsx("relative", open ? "z-[9999]" : "z-auto"),
      rootCls
    )}>

            <div className="relative flex-1">
              <Listbox.Button
                as="div"
                id={id}
                aria-invalid={hasError}
                className={twMerge(
                  clsx({
                    "relative w-full flex items-center justify-between gap-2 bg-white border-2 rounded-xl px-4 md:py-1.5 py-1 text-left cursor-pointer transition-all duration-200 ease-out": true,
                    "border-slate-200 hover:border-slate-300": !open && !hasError,
                    "border-blue-400 ring-4 ring-blue-50 shadow-sm": open && !hasError,
                    "border-red-400 ring-4 ring-red-50": hasError,
                  }),
                  buttonCls,
                  clsx({
                    [String(openButtonCls)]:
                      open && !!openButtonCls && openButtonCls.trim().length > 0,
                  })
                )}
              >
                <span
                  className={twMerge(
                    clsx({
                      "text-[13px] z-[9] truncate": true,
                      "text-slate-800 font-medium": hasValue,
                      "text-slate-400": !hasValue,
                    }),
                    !hasValue ? placeholderCls : undefined
                  )}
                >
                  {displayText}
                </span>

                <div className={twMerge(
                  "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200",
                  open ? "bg-blue-100 text-blue-600 rotate-180" : "bg-slate-100 text-slate-500"
                )}>
                  <IoIosArrowDown className="w-3 h-3" />
                </div>
              </Listbox.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-2 scale-95"
                enterTo="opacity-100 translate-y-0 scale-100"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0 scale-100"
                leaveTo="opacity-0 translate-y-2 scale-95"
              >
                <Listbox.Options
                  className={twMerge(
                    "absolute mt-2 z-[99999999] w-full overflow-hidden rounded-xl bg-white",
                    "border border-slate-200 shadow-xl shadow-slate-200/50",
                    "max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent",
                    "focus:outline-none",
                    "backdrop-blur-sm"
                  )}
                >
                  <div className="p-1.5">
                    {options?.map((optn, optnIdx) => (
                      <Listbox.Option
                        as="div"
                        key={`singleSelect-${optnIdx}`}
                        value={optn}
                      >
                        {({ selected, active }) => (
                          <div
                            className={twMerge(
                              clsx({
                                "flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-[13px] cursor-pointer select-none transition-all duration-150": true,
                                "text-slate-700": !selected && !active,
                                "bg-slate-50 text-slate-800": active && !selected,
                                "bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-700": selected && !active,
                                "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800": selected && active,
                              }),
                              optionCls,
                              clsx({
                                [String(selectedOptionCls)]:
                                  selected &&
                                  !!selectedOptionCls &&
                                  selectedOptionCls.trim().length > 0,
                              })
                            )}
                          >
                            <span className="truncate font-medium">
                              {optionsInterface.isObj
                                ? optionsInterface.displayKey
                                  ? optn[optionsInterface.displayKey] ?? ""
                                  : ""
                                : optn}
                            </span>

                            {selected && (
                              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                <FiCheck className="w-3 h-3 text-white" strokeWidth={3} />
                              </div>
                            )}
                          </div>
                        )}
                      </Listbox.Option>
                    ))}
                  </div>
                </Listbox.Options>
              </Transition>
            </div>

            {note && note.trim().length > 0 && (
              <p
                className={twMerge(
                  "text-right text-[11px] mt-1.5 text-slate-500 font-normal",
                  noteCls
                )}
              >
                {note}
              </p>
            )}

            {hasError && (
              <div className="flex items-center gap-1.5 mt-2">
                <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p
                  className={twMerge(
                    "text-red-500 text-xs font-medium",
                    errorCls
                  )}
                >
                  {errorMsg}
                </p>
              </div>
            )}
          </div>
        )}
      </Listbox>
    </div>
  );
}