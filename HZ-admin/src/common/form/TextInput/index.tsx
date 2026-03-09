// src/components/ui/form/TextInput.tsx
import React, { forwardRef } from "react";
import { ControlShell } from "../ControlShell";
import { cn } from "../../../utils/common/cn";

export type TextInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: boolean;
  containerClassName?: string;
  inputClassName?: string;
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(
    {
      leftIcon,
      rightIcon,
      error,
      containerClassName,
      inputClassName,
      disabled,
      ...props
    },
    ref
  ) {
    const safeProps: any = { ...props };
    if ("value" in safeProps && safeProps.value === null) {
      safeProps.value = "";
    }

    return (
      <ControlShell
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        error={error}
        disabled={disabled}
        className={containerClassName}
      >
        <input
          ref={ref}
          disabled={disabled}
          {...safeProps}
          className={cn(
            "w-full text-sm outline-none app-input placeholder:app-muted",
            disabled && "opacity-60 cursor-not-allowed",
            inputClassName
          )}
        />
      </ControlShell>
    );
  }
);

