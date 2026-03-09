import clsx from 'clsx';
import { Eye, EyeOff } from 'lucide-react';
import React, { DetailedHTMLProps, ReactNode, forwardRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';


export interface ICustomInputOtherProps {
  label?: string;
  sublabel?: string;
  labelCls?: string;
  sublabelcls?: string;
  note?: string;
  rootCls?: string;
  value?: string | number;
  errorMsg?: string;
  name: string;
  errorCls?: string;
  maxLength?: number;
  noteCls?: string;
  type: 'text' | 'textarea' | 'number' | 'url' | 'email' | 'password';
  outerInptCls?: string;
  leftIcon?: ReactNode;
  placeholder?: string;
  rightIcon?: ReactNode;
  unitsDropdown?: {
    options: string[];
    value: string;
    onChange: (value: string) => void;
  };
}

export type CustomInputRef = HTMLInputElement | HTMLTextAreaElement | any;

export type CustomInputAttributes =
  React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export type ICustomInputProps = DetailedHTMLProps<
  CustomInputAttributes,
  CustomInputRef
> &
  ICustomInputOtherProps;

const RenderInput = ({ type, ...props }: any) => {
  if (type === 'textarea') {
    return <textarea {...props} />;
  }
  return <input {...props} />;
};


const CustomInput = forwardRef<CustomInputRef, ICustomInputProps>(
  function CustomInput(props, ref) {
    const {
      label,
      sublabel,
      sublabelcls,
      type,
      leftIcon,
      rightIcon,
      name,
      rootCls,
      labelCls,
      errorMsg,
      note,
      noteCls,
      outerInptCls,
      className,
      errorCls,
      id,
      required,
      maxLength,
      unitsDropdown,
      placeholder,
      ...extraInputProps
    } = props;

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const handlePasswordToggle = () => {
      setIsPasswordVisible((prev) => !prev);
    };

    const hasError = !!errorMsg && errorMsg.trim().length > 0;

    return (
      <div className={twMerge('w-full group', rootCls)}>
        <div className='flex flex-col gap-0.5'>
          {label && label.trim().length > 0 && (
            <label
              htmlFor={id}
              className={twMerge(
                clsx({
                  'mb-1.5 inline-block text-[13px] font-semibold text-slate-700 tracking-wide transition-colors duration-200':
                    true,
                  'cursor-pointer': id,
                  'text-blue-600': isFocused && !hasError,
                  'text-red-500': hasError,
                }),
                labelCls
              )}
            >
              {label}
              {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
          )}

          {sublabel && sublabel.trim().length > 0 && (
            <label
              htmlFor={id}
              className={twMerge(
                clsx({
                  'mb-1.5 inline-block text-xs font-normal text-slate-500':
                    true,
                  'cursor-pointer': id,
                }),
                sublabelcls
              )}
            >
              {sublabel}
            </label>
          )}
        </div>

        {type === 'textarea' ? (
          <div className="relative">
            <RenderInput
              ref={ref}
              id={id}
              required={required}
              name={name}
              type={type}
              maxLength={maxLength}
              placeholder={placeholder}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={twMerge(
                clsx({
                  'w-full px-4 py-3 bg-white border-2 rounded-xl text-[13px] text-slate-800 transition-all duration-200 ease-out':
                    true,
                  'border-slate-200 hover:border-slate-300': !hasError && !isFocused,
                  'border-blue-400 ring-4 ring-blue-50 shadow-sm': isFocused && !hasError,
                  'border-red-400 ring-4 ring-red-50': hasError,
                  'focus:outline-none resize-none min-h-[100px]': true,
                  'placeholder:text-slate-400 placeholder:text-[13px]': true,
                  'cursor-default bg-slate-50': extraInputProps.readOnly,
                  [String(className)]: !!className,
                })
              )}
              {...extraInputProps}
            />
            {maxLength && (
              <div className="absolute bottom-2 right-3 text-[10px] text-slate-400">
                {String(extraInputProps.value || '').length}/{maxLength}
              </div>
            )}
          </div>
        ) : (
          <div
            className={twMerge(
              clsx({
                'w-full flex gap-2 bg-white items-center border-2 rounded-xl px-4 py-2 transition-all duration-200 ease-out':
                  true,
                'border-slate-200 hover:border-slate-300': !hasError && !isFocused,
                'border-blue-400 ring-4 ring-blue-50 shadow-sm': isFocused && !hasError,
                'border-red-400 ring-4 ring-red-50': hasError,
              }),
              outerInptCls
            )}
          >
            {leftIcon && (
              <span className={twMerge(
                "text-slate-400 transition-colors duration-200 flex-shrink-0",
                isFocused && "text-blue-500"
              )}>
                {leftIcon}
              </span>
            )}
            <RenderInput
              ref={ref}
              id={id}
              required={required}
              name={name}
              placeholder={placeholder}
              type={type === 'password' && !isPasswordVisible ? 'password' : 'text'}
              maxLength={maxLength}
              onFocus={(e: any) => {
                setIsFocused(true);
                extraInputProps.onFocus?.(e);
              }}
              onBlur={(e: any) => {
                setIsFocused(false);
                extraInputProps.onBlur?.(e);
              }}
              onKeyPress={(e: any) => {
                if (type === "number" && !/^\d*$/.test(e.key)) {
                  e.preventDefault();
                }
                extraInputProps.onKeyPress?.(e);
              }}
              className={twMerge(
                clsx({
                  'flex-1 min-w-0 bg-transparent text-[13px] text-slate-800 focus:outline-none':
                    true,
                  'placeholder:text-slate-400 placeholder:text-[13px]': true,
                  'cursor-default': extraInputProps.readOnly,
                  [String(className)]: !!className,
                })
              )}
              {...extraInputProps}
            />
            {unitsDropdown && (
              <select
                value={unitsDropdown.value}
                onChange={(e) => unitsDropdown.onChange(e.target.value)}
                className="text-[12px] bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white px-3 py-1.5 font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer transition-all duration-200 hover:from-blue-600 hover:to-blue-700"
              >
                <option className="bg-white text-slate-700 text-[13px]">
                  Units
                </option>
                {unitsDropdown.options.map((option) => (
                  <option key={option} value={option} className="bg-white text-slate-700 text-[13px]">
                    {option}
                  </option>
                ))}
              </select>
            )}
            {type === "password" && (
              <button
                type="button"
                className={twMerge(
                  "p-1 rounded-lg transition-all duration-200 flex-shrink-0",
                  "text-slate-400 hover:text-slate-600 hover:bg-slate-100",
                  "focus:outline-none focus:ring-2 focus:ring-blue-200"
                )}
                onClick={handlePasswordToggle}
                title={isPasswordVisible ? "Hide Password" : "Show Password"}
              >
                {isPasswordVisible ? (
                  <Eye size={14} />
                ) : (
                  <EyeOff size={14} />
                )}
              </button>
            )}
            {rightIcon && (
              <span className={twMerge(
                "text-slate-400 transition-colors duration-200 flex-shrink-0",
                isFocused && "text-blue-500"
              )}>
                {rightIcon}
              </span>
            )}
          </div>
        )}

        {note && note.trim().length > 0 && (
          <p
            className={twMerge(
              'text-right text-[11px] mt-1.5 text-slate-500 font-normal',
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
                'text-red-500 text-xs font-medium',
                errorCls
              )}
            >
              {errorMsg}
            </p>
          </div>
        )}
      </div>
    );
  }
);

export default CustomInput;
