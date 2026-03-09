import clsx from "clsx";
import React, { forwardRef, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface CheckboxProps {
  required?: boolean;
  className?: string;
  type: "checkbox";
  name: string;
  inputExtraProps?: any;
  label?: string | ReactNode;
  labelCls?: string;
}

type CheckboxRef = HTMLInputElement;

type CheckboxAttributes = React.InputHTMLAttributes<HTMLInputElement>;

export type CheckboxInputProps = React.DetailedHTMLProps<
  CheckboxAttributes,
  CheckboxRef
> &
  CheckboxProps;

const CheckboxInput = forwardRef<CheckboxRef, CheckboxInputProps>(
  (props, ref) => {
    const {
      id,
      label,
      required,
      type = "checkbox",
      name,
      className,
      labelCls,
      ...inputExtraProps
    } = props;
    return (
      <div className="flex w-full items-center gap-x-[10px]">
        <input
          ref={ref}
          type={type}
          id={id}
          name={name}
          required={required}
          className={clsx(
            "h-3 w-3 rounded-sm cursor-pointer text-[#636B70] accent-gray-700 focus:ring-gray-700",
            className,
          )}
          {...inputExtraProps}
        />
        {label && (
          <label
            htmlFor={id}
            className={twMerge("line-clamp-3 block w-full overflow-hidden text-ellipsis break-words text-xs font-regular leading-[15px] text-gray-800", labelCls)}
          >
            {label}
            {required && <sup>*</sup>}
          </label>
        )}
      </div>
    );
  },
);

CheckboxInput.displayName = "CheckboxInput";

export default CheckboxInput;