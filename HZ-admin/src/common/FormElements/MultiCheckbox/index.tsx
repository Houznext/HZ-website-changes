import { ClassNames } from '@emotion/react';
import React, { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

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
    ClassName?: string
}

const MultiCheckbox: React.FC<MultiCheckboxProps> = ({
    label,
    labelCls,
    options,
    selectedValues = [],
    onChange,
    ClassName
}) => {
    const [selected, setSelected] = useState<string[]>(selectedValues);

    const handleChange = (value: string) => {
        const isSelected = selected.includes(value);
        const updatedSelection = isSelected
            ? selected.filter((item) => item !== value)
            : [...selected, value];
        setSelected(updatedSelection);
        onChange(updatedSelection);
    };
    useEffect(() => {
        setSelected(selectedValues)
    }, [selectedValues])

    return (
        <div className="w-full">
            {label && <div className={twMerge("text-lg font-medium text-gray-800 mb-3", labelCls)}>{label}</div>}

             <div className="flex flex-wrap md:gap-3 gap-0.5">
                {options.map((option) => (
                    <label
                        key={option.value}
                        className="flex items-center gap-2 px-4 py-2 rounded-md   cursor-pointer"
                    >
                        <input
                            type="checkbox"
                            value={option.value}
                            checked={selected.includes(option.value)}
                            onChange={() => handleChange(option.value)}
                            className={twMerge("w-4 h-4 bg-[#3d4d83] rounded border-gray-300 focus:ring-2 focus:ring-blue-300 cursor-pointer", ClassName)}
                        />
                        <span className="md:text-sm text-[12px] font-medium text-gray-700">{option.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default MultiCheckbox;
