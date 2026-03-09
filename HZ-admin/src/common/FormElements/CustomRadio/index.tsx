import React, { forwardRef, ReactNode } from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ICustomRadioProps {
  label?: string;
  sublabel?: string;
  options: { label: string; value: any }[]; // Radio options
  name: string;
  value: any;
  onChange: (value: any) => void;
  labelCls?: string;
  sublabelCls?: string;
  errorMsg?: string;
  errorCls?: string;
  rootCls?: string;
  required?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const CustomRadio = forwardRef<HTMLInputElement, ICustomRadioProps>(
  function CustomRadio(props, ref) {
    const {
      label,
      sublabel,
      options,
      name,
      value,
      onChange,
      required,
      labelCls,
      sublabelCls,
      rootCls,
      errorMsg,
      errorCls,
      leftIcon,
      rightIcon,
    } = props;

    return (
      <div className={twMerge('w-full', rootCls)}>
        {label && (
          <label
            className={twMerge(
              'block text-sm font-regular text-[#333333] mb-2',
              labelCls
            )}
          >
            {label}
            {required && <sup className='text-red-500'>*</sup>}
          </label>
        )}

        {sublabel && (
          <label
            className={twMerge(
              'block text-xs text-gray-600 mb-2',
              sublabelCls
            )}
          >
            {sublabel}
          </label>
        )}

        <div className='flex flex-wrap items-center gap-4'>
          {options.map((option) => (
            <label
              key={option.value}
              className={clsx(
                'flex items-center cursor-pointer text-sm font-regular',
                value === option.value ? 'text-[#3586FF] ' : 'text-gray-600'
              )}
            >
              <input
                ref={ref}
                type='radio'
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                className='hidden'
              />
              <div
                className={clsx(
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2',
                  value === option.value
                    ? 'border-[#5297ff]'
                    : 'border-gray-400'
                )}
              >
                {value === option.value && (
                  <div className='w-2 h-2 bg-[#5297ff] rounded-full'></div>
                )}
              </div>
              {option.label}
            </label>
          ))}
        </div>

        {errorMsg && (
          <p className={twMerge('text-red-400 text-xs mt-1', errorCls)}>
            {errorMsg}
          </p>
        )}
      </div>
    );
  }
);

export default CustomRadio;
