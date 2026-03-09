import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface FloatingDatePickerProps {
    label?: string;
    labelCls?: string;
    labelouterCls?: string;
    selectedDate: Date | null;
    onChange: (date: Date | null) => void;
    placeholder?: string;
    name?: string;
    required?: boolean;
    errorMsg?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    outerInptCls?: string;
    className?: string;
    errorCls?: string;
}

const FloatingDatePicker: React.FC<FloatingDatePickerProps> = ({
    label,
    labelCls,
    selectedDate,
    onChange,
    placeholder,
    labelouterCls,
    name,
    required,
    errorMsg,
    leftIcon,
    rightIcon,
    outerInptCls,
    className,
    errorCls,
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        if (!selectedDate) {
            setIsFocused(false);
        }
    };

    return (
        <>
            <div className={twMerge('relative w-full max-w-md border-b-2 rounded-sm border-gray-300', outerInptCls)}>
                <label
                    className={twMerge(
                        'absolute -left-4 top-1/2 transform -translate-y-1/2 translate-x-1/2 text-[14px] text-gray-500 transition-all duration-200',
                        isFocused || selectedDate ? twMerge('top-[-0.2rem] -left-9 text-[14px] font-medium text-black ', labelCls) : 'text-base',
                        labelouterCls
                    )}
                >
                    {label} {required && <span className="text-red-600">*</span>}
                </label>

                <div
                    className={twMerge(
                        'relative flex items-center rounded-lg px-3 py-[2px] border-transparent',
                        'focus-within:border-transparent'
                    )}
                >
                    {leftIcon && <div className="mr-2">{leftIcon}</div>}
                    <DatePicker
                        selected={selectedDate}
                        onChange={onChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholderText={placeholder}
                        className={twMerge(
                            'w-full bg-transparent focus:ring-0 focus:outline-none border-none',
                            className,
                            'pl-2'
                        )}
                        name={name}
                        dateFormat="MMMM d, yyyy"
                    />
                    {rightIcon && <div className="absolute right-3">{rightIcon}</div>}
                </div>


            </div>
            {errorMsg && (
                <p className={twMerge('text-red-400 text-xs', errorCls)}>
                    {errorMsg}
                </p>
            )}
        </>
    );
};

export default FloatingDatePicker;
