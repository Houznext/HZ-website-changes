import { twMerge } from "tailwind-merge";

export default function YearSelect({
    label,
    labelCls,
    name,
    value,
    onChange,
    required,
    errorMsg,
    startYear = 1950,
    endYear = new Date().getFullYear(),
    isAgeSelect = false,
}: any) {
    const years = isAgeSelect
        ? Array.from({ length: 30 }, (_, i) => i + 1)
        : Array.from({ length: endYear - startYear + 1 }, (_, i) => endYear - i);

    return (
        <div className="flex flex-col gap-1.5">
            <label className={twMerge("label-text text-gray-700", labelCls)}>
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                name={name}
                value={value ?? ""}
                onChange={(e) => onChange(+e.target.value)}
                className={twMerge(
                    "w-full px-3 md:py-1 py-0.5 rounded-lg sublabel-text bg-white border transition-all focus:ring-1 focus:outline-none",
                    errorMsg 
                        ? "border-red-400 focus:ring-red-400 focus:border-red-400" 
                        : "border-gray-200 focus:ring-[#3586FF] focus:border-[#3586FF] hover:border-gray-300"
                )}
                required={required}
            >
                <option value="">Select {isAgeSelect ? "Age" : "Year"}</option>
                {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>
            {errorMsg && <p className="sublabel-text text-red-500 mt-0.5">{errorMsg}</p>}
        </div>
    );
}