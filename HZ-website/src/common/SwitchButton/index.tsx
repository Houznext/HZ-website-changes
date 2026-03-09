import React, { useState } from 'react';
import clsx from 'clsx';

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
    activeColor?: string;
    inactiveColor?: string;
    knobColor?: string;
    label?: React.ReactNode;
}

const Switch: React.FC<SwitchProps> = ({
    defaultChecked = false,
    checked,
    onChange,
    disabled = false,
    activeColor = '#0398fc',
    inactiveColor = '#3FB0A4',
    knobColor = '#0398fc',
    className = '',
    label,
    ...props
}) => {
    const [internalChecked, setInternalChecked] = useState(defaultChecked);

    const isChecked = checked !== undefined ? checked : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (checked === undefined) {
            setInternalChecked(e.target.checked);
        }
        if (onChange) {
            onChange(e);
        }
    };

    return (
        <label className="flex items-center gap-2 cursor-pointer">
            <div
                className={clsx(
                    'relative inline-flex h-6 w-12 items-center rounded-full px-1 transition-colors duration-300 ease-in-out',
                    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                    className
                )}
                style={{
                    backgroundColor: isChecked ? activeColor : inactiveColor,
                }}
            >
                <input
                    type="checkbox"
                    className="sr-only"
                    checked={isChecked}
                    disabled={disabled}
                    onChange={handleChange}
                    {...props}
                />
                <span
                    className={clsx(
                        'h-5 w-5 rounded-full shadow transition-transform duration-300 ease-in-out',
                        isChecked ? 'translate-x-6' : 'translate-x-0'
                    )}
                    style={{
                        backgroundColor: knobColor,
                    }}
                />
            </div>
            {label && <span className="text-sm text-gray-700">{label}</span>}
        </label>
    );
};

export default Switch;
