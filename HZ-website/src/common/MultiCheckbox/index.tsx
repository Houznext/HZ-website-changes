import React from 'react';
import { twMerge } from 'tailwind-merge';
import { HiCheck } from 'react-icons/hi';

interface CheckboxOption {
    label: string;
    value: string;
}

interface MultiCheckboxProps {
    label?: string;
    labelCls?: string;
    options: CheckboxOption[];
    selectedValues?: string[];
    onChange: (selected: string[]) => void;
    ClassName?: string;
    required?: boolean;
}

const MultiCheckbox: React.FC<MultiCheckboxProps> = ({
    label,
    labelCls,
    options,
    selectedValues = [],
    onChange,
    ClassName,
    required,
}) => {
    const handleChange = (value: string) => {
        const isSelected = selectedValues.includes(value);
        const updatedSelection = isSelected
            ? selectedValues.filter((item) => item !== value)
            : [...selectedValues, value];
        onChange(updatedSelection);
    };

    return (
        <div className="w-full">
            {label && (
                <div className={twMerge('text-lg font-medium text-gray-800 mb-3', labelCls)}>
                    {label}
                    {required && <span className="text-red-500">*</span>}
                </div>
            )}

            <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                    const isChecked = selectedValues.includes(option.value);

                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleChange(option.value)}
                            className={twMerge(
                                'inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 cursor-pointer select-none',
                                isChecked
                                    ? 'bg-blue-50 border-[#3586FF] text-[#3586FF] ring-1 ring-[#3586FF]/20'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50',
                                ClassName,
                            )}
                        >
                            <span
                                className={twMerge(
                                    'flex items-center justify-center w-[18px] h-[18px] rounded border-[1.5px] transition-all duration-200 flex-shrink-0',
                                    isChecked
                                        ? 'bg-[#3586FF] border-[#3586FF]'
                                        : 'bg-white border-gray-300',
                                )}
                            >
                                {isChecked && <HiCheck className="w-3 h-3 text-white" />}
                            </span>
                            <span className="md:text-[13px] text-[12px]">{option.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MultiCheckbox;
