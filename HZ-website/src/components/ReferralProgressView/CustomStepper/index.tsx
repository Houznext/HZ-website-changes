import React from "react";

type StepItem = {
    key: number;
    label: string;
    date?: string | null;
    description?: string | null;
};

const formatDate = (d?: string | null) => {
    if (!d) return "";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export default function CustomStepper({
    currentStep,
    steps,
}: {
    currentStep: number;
    steps: StepItem[];
}) {
    const safeCurrent = Math.min(Math.max(currentStep || 1, 1), steps.length);

    return (
        <div className="w-full bg-white border border-[#E8E8E8] rounded-2xl p-4 md:p-6">
            <div className="w-full overflow-x-auto">
                <div className="min-w-[860px] md:min-w-0">
                    <div className="flex items-start justify-between gap-6 relative">
                        {steps.map((s, idx) => {
                            const isDone = s.key < safeCurrent;
                            const isActive = s.key === safeCurrent;

                            return (
                                <div key={s.key} className="flex-1">
                                    {idx !== 0 && (
                                        <div className="absolute left-0 right-0 top-[18px] h-[2px] bg-[#EDEDED]" />
                                    )}

                                    <div className="relative flex flex-col items-center text-center">
                                        <div
                                            className={[
                                                "h-10 w-10 rounded-full flex items-center justify-center border-2 z-10",
                                                isDone
                                                    ? "bg-[#3586FF] border-[#3586FF]"
                                                    : isActive
                                                        ? "bg-white border-[#3586FF]"
                                                        : "bg-white border-[#D6D6D6]",
                                            ].join(" ")}
                                        >
                                            {isDone ? (
                                                <svg
                                                    width="18"
                                                    height="18"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                >
                                                    <path
                                                        d="M20 6L9 17l-5-5"
                                                        stroke="white"
                                                        strokeWidth="2.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            ) : (
                                                <span
                                                    className={[
                                                        "text-[13px] font-medium",
                                                        isActive ? "text-[#3586FF]" : "text-[#8A8A8A]",
                                                    ].join(" ")}
                                                >
                                                    {s.key}
                                                </span>
                                            )}
                                        </div>

                                        <div
                                            className={[
                                                "mt-3 text-[13px] md:text-[14px] leading-[18px] max-w-[160px]",
                                                isDone
                                                    ? "text-[#3586FF] font-medium"
                                                    : isActive
                                                        ? "text-[#212227] font-medium"
                                                        : "text-[#7A7A7A] font-regular",
                                            ].join(" ")}
                                        >
                                            {s.label}
                                        </div>

                                        <div className="mt-1 text-[11px] md:text-[12px] text-[#717171] font-regular">
                                            {formatDate(s.date)}
                                        </div>

                                        {(isActive || isDone) && s.description ? (
                                            <div className="mt-2 text-[11px] md:text-[12px] text-[#3586FF] font-regular max-w-[180px]">
                                                {s.description}
                                            </div>
                                        ) : (
                                            <div className="mt-2 h-[16px]" />
                                        )}
                                    </div>

                                    {idx !== 0 && (
                                        <div
                                            className={[
                                                "absolute top-[18px] h-[2px] z-[5]",
                                                isDone ? "bg-[#3586FF]" : "bg-[#EDEDED]",
                                            ].join(" ")}
                                            style={{
                                                left: `${(idx - 1) * (100 / (steps.length - 1))}%`,
                                                width: `${100 / (steps.length - 1)}%`,
                                            }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
                <div className="text-[#212227] font-medium text-[14px]">
                    Current stage:{" "}
                    <span className="text-[#3586FF]">{steps[safeCurrent - 1]?.label}</span>
                </div>

                <div className="px-3 py-1 rounded-full bg-[#F5FAFF] border border-[#D6E8FF] text-[#3586FF] text-[12px] font-medium">
                    Step {safeCurrent} / {steps.length}
                </div>
            </div>
        </div>
    );
}
