import clsx from 'clsx';
import React, { DetailedHTMLProps, ReactNode, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface ICustomDateProps {
    label?: string;
    sublabel?: string;
    labelCls?: string;
    sublabelCls?: string;
    note?: string;
    noteCls?: string;
    rootCls?: string;
    value?: string | Date | any;
    errorMsg?: string;
    name?: string;
    errorCls?: string;
    outerInputCls?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
      type?: "date" | "time" | "datetime-local"; 
}

export type CustomDateRef = HTMLInputElement;

export type CustomDateAttributes = React.InputHTMLAttributes<HTMLInputElement>;

export type ICustomDateFullProps = DetailedHTMLProps<
    CustomDateAttributes,
    CustomDateRef
> &
    ICustomDateProps;

const CustomDate = forwardRef<CustomDateRef, ICustomDateFullProps>(
    function CustomDate(props, ref) {
        const {
            label,
            sublabel,
            sublabelCls,
            leftIcon,
            rightIcon,
            name,
            rootCls,
            labelCls,
            errorMsg,
            note,
            noteCls,
            outerInputCls,
            className,
            errorCls,
            id,
            required,
            value,
              type = "date",
            ...extraInputProps
        } = props;

        return (
            <div className={twMerge('w-full', rootCls)}>
                <div className="flex flex-col">
                    {label && label.trim().length > 0 && (
                        <label
                            htmlFor={id}
                            className={twMerge(
                                clsx({
                                    'mb-2 inline-block text-sm font-regular text-[#333333]':
                                        true,
                                    'cursor-pointer': id,
                                }),
                                labelCls
                            )}
                        >
                            {label}
                            {required && <sup className={'text-red-500'}>*</sup>}
                        </label>
                    )}

                    {sublabel && sublabel.trim().length > 0 && (
                        <label
                            htmlFor={id}
                            className={twMerge(
                                clsx({
                                    'mb-2 inline-block text-sm font-regular text-[#333333]':
                                        true,
                                    'cursor-pointer': id,
                                }),
                                sublabelCls
                            )}
                        >
                            {sublabel}
                            {required && <sup className={'text-red-500'}>*</sup>}
                        </label>
                    )}
                </div>

                <div
                    className={twMerge(
                        clsx({
                            'w-full flex gap-1 mb-1 items-center border border-solid rounded-[6px] border-[#C7C2C2] focus-within:border-blue-400 px-3 py-2':
                                true,
                        }),
                        outerInputCls,
                        clsx({
                            'border-red-400 focus-within:border-red-400':
                                !!errorMsg && errorMsg.trim().length > 0,
                        })
                    )}
                >
                    {leftIcon ? leftIcon : null}
                    <input
                        ref={ref}
                        id={id}
                        required={required}
                        name={name}
                        // type="date"
                        type={type}

                        value={value}
                        className={twMerge(
                            clsx({
                                'h-fit w-full border-none bg-transparent text-[13px] focus:border-none focus:ring-0 active:outline-none focus:outline-none rounded-[inherit]':
                                    true,
                                'placeholder:text-[12px] placeholder:font-regular placeholder:normal-case placeholder:text-gray-500':
                                    true,
                                'pl-2': leftIcon,
                                'pr-2': rightIcon,
                                [String(className)]: !!className,
                            })
                        )}
                        {...extraInputProps}
                    />
                    {rightIcon ? rightIcon : null}
                </div>

                {note && note.trim().length > 0 && (
                    <p
                        className={twMerge(
                            clsx({ 'text-right text-[9px] mb-1 text-gray-700': true }),
                            noteCls
                        )}
                    >
                        {note}
                    </p>
                )}
                {errorMsg && errorMsg.trim().length > 0 && (
                    <p
                        className={twMerge(
                            clsx({ 'text-red-400 text-xs mt-1 font-regular': true }),
                            errorCls
                        )}
                    >
                        {errorMsg}
                    </p>
                )}
            </div>
        );
    }
);

export default CustomDate;