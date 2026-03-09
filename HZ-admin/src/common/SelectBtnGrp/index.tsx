import React, { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

type OptionObj = { name: string; label?: string; icon?: React.ReactNode };
type Option = string | OptionObj;

interface SelectBtnGrpProps {
    options: Option[];
    label?: string;
    labelCls?: string;
    className?: string;
    required?: boolean;
    btnClass?: string;
    onSelectChange?: (selectedOption: Option) => void;
    defaultValue?: string | Option;
    slant?: boolean;
    error?: string;
    errorCls?: string;
}

const getOptionName = (opt: Option | null | undefined): string => {
    if (!opt) return '';
    return typeof opt === 'string' ? opt : opt.name;
};

const SelectBtnGrp: React.FC<SelectBtnGrpProps> = ({
    error,
    errorCls,
    options,
    label,
    labelCls,
    className,
    btnClass,
    onSelectChange,
    defaultValue,
    slant
}) => {
    const [selectedName, setSelectedName] = useState<string>(getOptionName(defaultValue));

    useEffect(() => {
        if (defaultValue) {
            setSelectedName(getOptionName(defaultValue));
        }
    }, [defaultValue]);

    const handleSelect = (option: Option) => {
        setSelectedName(getOptionName(option));
        onSelectChange?.(option);
    };

    const isSelected = (option: Option): boolean => {
        return getOptionName(option) === selectedName;
    };

    const getOptionLabel = (option: Option) => {
        if (typeof option === 'string') {
            return option;
        }
        const displayText = option.label || option.name;
        if (option.icon) {
            return (
                <div className='flex flex-col items-center min-w-[50px] gap-1.5'>
                    <span className={twMerge(
                        'text-[18px] md:text-[22px]',
                        isSelected(option) ? 'text-white' : 'text-[#3586FF]'
                    )}>
                        {option.icon}
                    </span>
                    <p className={twMerge(
                        'md:text-[12px] text-[10px] font-medium break-words text-center leading-snug',
                        isSelected(option) ? 'text-white' : 'text-gray-700'
                    )}>
                        {displayText}
                    </p>
                </div>
            );
        }
        return displayText;
    };

    return (
        <div className='flex flex-col'>
            <p className={twMerge('md:text-[14px] text-[12px] font-medium flex text-gray-600 mb-2 relative', labelCls)}>
                {label} <span className='text-red-500'>*</span>
            </p>
            <div className={twMerge('flex', className)}>
                {options.map((option, index) => (
                    <button
                        key={index}
                        type="button"
                        className={twMerge(
                            'relative px-4 py-[6px] border mb-2 transition duration-300 ease-in-out hover:bg-gray-200',
                            isSelected(option)
                                ? 'bg-[#3586FF] !text-white hover:bg-[#3586FF]'
                                : 'bg-white !text-black border-gray-300',
                            btnClass
                        )}
                        style={{ transform: slant ? 'skewX(-20deg)' : 'skewX(0deg)' }}
                        onClick={() => handleSelect(option)}
                    >
                        <span style={{ display: 'block', transform: slant ? 'skewX(20deg)' : 'skewX(0deg)' }}>
                            {getOptionLabel(option)}
                        </span>
                    </button>
                ))}
            </div>
            {error && (
                <p className={twMerge('text-red-500 md:text-[12px] text-[10px]', errorCls)}>
                    {error}
                </p>
            )}
        </div>
    );
};

export default SelectBtnGrp;