export const Legend = ({ data }) => {
    return (
        <div className="flex items-center md:gap-3 gap-1  md:text-[12px] text-[10px] font-medium">
            {data.map(({ colorclass, label }) => (
                <div key={label} className="flex items-center gap-1">
                    <span
                        className={`md:w-3 w-2.5 md:h-3 h-2.5 rounded-[4px] ${colorclass}`}
                    ></span>
                    <span>{label}</span>
                </div>
            ))}
        </div>
    );
};

