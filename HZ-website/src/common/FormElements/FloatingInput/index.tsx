import React, { useState } from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { root } from 'postcss';

interface FloatingInputProps {
    label?: string;
    labelCls?: string;
    labelouterCls?: string;
    value: string | number | any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    placeholder?: string;
    unit?: string;
    type?: "text" | "email" | "password" | "number" | "textarea";
    name?: string;
    required?: boolean;
    errorMsg?: string;
    maxLength?: number;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    outerInptCls?: string;
    className?: string;
    errorCls?: string;
    disabled?: boolean;
    rootCls?: string;
}


const FloatingInput: React.FC<FloatingInputProps> = ({
    label,
    labelCls,
    rootCls,
    value,
    onChange,

    unit,
    type = 'text',
    name,
    required,
    errorMsg,
    maxLength,
    leftIcon,
    rightIcon,
    outerInptCls,
    className,
    errorCls,
    disabled
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.value) {
            setIsFocused(false);
        }
    };

    return (
        <div className={twMerge('relative w-full max-w-md mb-4', rootCls)}>
            <div
                className={twMerge(
                    ' border-b-2 rounded-sm',
                    errorMsg ? 'border-red-400' : 'border-gray-300',

                )}
            >
                <label
                    className={twMerge(
                        'absolute  top-1/2 transform -translate-y-1/2 text-[14px] text-gray-500 transition-all duration-200',
                        isFocused || value
                            ? twMerge('-top-[0.2rem]  text-[14px] font-medium text-black ', labelCls)
                            : 'text-base',
                    )}
                >
                    {label} {required && <span className="text-red-600">*</span>}
                </label>

                <div
                    className={twMerge(
                        'relative flex items-center rounded-lg px-2 py-[2px] border-transparent',
                        'focus-within:border-transparent'
                    )}
                >
                    {leftIcon && <div className="mr-2">{leftIcon}</div>}
                    <input
                        type={type}
                        name={name}
                        value={value}
                        onChange={onChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        maxLength={maxLength}
                        className={twMerge(
                            'w-full bg-transparent focus:ring-0 focus:outline-none border-none',
                            className,
                            'pl-2'
                        )}
                        disabled={disabled}
                    />
                    {rightIcon && <div className="ml-2">{rightIcon}</div>}
                    {unit && (
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            {unit}
                        </span>
                    )}
                </div>
            </div>
            {errorMsg && (
                <p className={twMerge('text-red-400 text-xs -mt-5 ml-2', errorCls)}>
                    {errorMsg}
                </p>
            )}
        </div>
    );
};

export default FloatingInput;