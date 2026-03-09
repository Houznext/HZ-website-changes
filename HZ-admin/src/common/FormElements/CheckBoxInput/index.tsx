import clsx from 'clsx';
import React, { DetailedHTMLProps, ReactNode, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export interface ICustomCheckboxProps {
  label?: string;
  labelCls?: string;
  errorMsg?: string;
  name: string;
  errorCls?: string;
  rootCls?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  ref?: any;
}

export type CustomInputRef = HTMLInputElement | HTMLTextAreaElement | any;


export type CustomInputAttributes =
  React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export type ICustomICheckProps = DetailedHTMLProps<
  CustomInputAttributes,
  CustomInputRef
> &
ICustomCheckboxProps;


const CustomCheckbox = forwardRef<CustomInputRef, ICustomCheckboxProps>(
  function CustomCheckbox(props, ref) {
    const {
      label,
      labelCls,
      errorMsg,
      name,
      errorCls,
      rootCls,
      checked,
      onChange,
      disabled,
      required,
      className
    } = props;

    return (
      <div className={twMerge('w-full', rootCls)}>
        <div className="flex items-center gap-2">
          <input
            ref={ref}
            type="checkbox"
            name={name}
            checked={checked}
            onChange={(e) => onChange?.(e.target.checked)}
            disabled={disabled}
            required={required}
            className={twMerge(
              ' border border-gray-300 rounded-sm focus:ring-blue-400 focus:ring-2',
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
              !!errorMsg && 'border-red-400 focus:ring-red-400', className
            )}
          />
          {label && (
            <label
              htmlFor={name}
              className={twMerge(
                clsx('text-sm font-regular text-[#333333]'),
                labelCls,
                disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              {label}
              {required && <sup className="text-red-500">*</sup>}
            </label>
          )}
        </div>

        {errorMsg && errorMsg.trim().length > 0 && (
          <p
            className={twMerge(
              'text-red-400 text-xs mt-1 font-regular',
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

export default CustomCheckbox;
