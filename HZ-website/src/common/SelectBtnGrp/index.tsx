import React, { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

interface SelectBtnGrpProps {
    options: any[];
    label?: string;
    labelCls?: string;
    className?: string;
    required?: boolean;
    btnClass?: string;
    onSelectChange?: (selectedOption: string | object) => void;
    defaultValue?: string | object;
    slant?: boolean;
    error?: string;
    errorCls?: string;
}

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
    const [selectedOption, setSelectedOption] = useState<string | object | null>(defaultValue || null);

    useEffect(() => {
        if (defaultValue) {
            setSelectedOption(defaultValue);
        }
    }, [defaultValue]);

    const handleSelect = (option: string | object) => {
        setSelectedOption(option);

        if (onSelectChange) {
            onSelectChange(option);
        }
    };

    const getOptionLabel = (option: string | { name: string; icon?: React.ReactNode }) => {
        if (typeof option === 'string') {
            return option;
        }
        if (option.name) {
            return (
                <div className='flex flex-col max-w-[80px] min-w-[30px] gap-2'>
                    <div className='text-[5px]'>
                        {option.icon && <span className="mr-2">{option.icon}</span>}
                    </div>
                    <p className={twMerge(
                        'md:text-[12px] text-[10px] font-medium break-words text-center leading-snug',
                        isSelected(option) ? 'text-white' : 'text-black'
                    )}>
                        {option.name}
                    </p>

                </div>
            );
        }
        return null;
    };

    const isSelected = (option: string | object) => {
        if (typeof option === 'string') {
            return selectedOption === option;
        }
        if (typeof selectedOption === 'object') {
            return typeof selectedOption === 'object' && selectedOption && (selectedOption as any).name === (option as any).name;
        }
        return typeof option === 'object' && selectedOption && (selectedOption === (option as any).name);
    };

    return (
        <>
        <div className='flex flex-col'>

       
            <p className={twMerge(`md:text-[14px]  text-[12px] font-medium flex  text-gray-600 mb-2 relative`, labelCls)}>{label} <span className='text-red-500'>*</span></p>
            <div className={twMerge('flex', className)}>
                {options.map((option, index) => (
                    <button
                        key={index}
                         type="button" 
                        className={twMerge(
                            `relative px-4 py-[6px] border mb-2 transition duration-300 ease-in-out hover:bg-gray-200`,
                            isSelected(option)
                                ? 'bg-[#3586FF] !text-white hover:bg-[#3586FF]'
                                : 'bg-white !text-black border-gray-300',
                            btnClass
                        )}
                        style={{
                            transform: slant ? 'skewX(-20deg)' : 'skewX(0deg)',
                        }}
                        onClick={() => handleSelect(option)}
                    >
                        <span
                            style={{
                                display: 'block',
                                transform: slant ? 'skewX(20deg)' : 'skewX(0deg)',
                            }}
                        >
                            {getOptionLabel(option)}
                        </span>
                    </button>
                ))}
            </div>
            {error && (
                <p className={twMerge('text-red-500  md:text-[12px] text-[10px]', errorCls)}>
                    {error}
                </p>
            )}
             </div>
        </>
    );
};

export default SelectBtnGrp;