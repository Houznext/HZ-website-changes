import React, { useMemo, useRef, useEffect, useCallback } from "react";
import useCustomBuilderStore from "@/src/stores/custom-builder";
import { CheckIcon } from "lucide-react";

/** Keep your original labels */
export const CustomBuilderSteps = [
  "Customer Information",
  "Property Information",
  "Service Required",
  "Summary Estimation",
];

const StepperC = () => {
  const { onboardingSteps, setOnboardingSteps } = useCustomBuilderStore();
  const steps = CustomBuilderSteps;
  const count = steps.length;

  const containerRef = useRef<HTMLDivElement>(null);

  const progressPercent = useMemo(() => {
    if (count <= 1) return 0;
    return (onboardingSteps / (count - 1)) * 100;
  }, [onboardingSteps, count]);

  const goTo = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= count) return;
      setOnboardingSteps(idx);
    },
    [count, setOnboardingSteps]
  );

  // Keyboard navigation: left/right arrows
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(onboardingSteps + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(onboardingSteps - 1);
      }
    };
    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, [goTo, onboardingSteps]);

  const isCompleted = (i: number) => i < onboardingSteps;
  const isActive = (i: number) => i === onboardingSteps;

  return (
    <div className="w-full md:w-[72%] mx-auto  mb-6 mt-5">
      <div className="grid grid-cols-4 gap-2 text-center text-[12px] md:text-[14px] font-bold text-gray-600 mb-2">
        {steps.map((label, i) => (
          <div
            key={label}
            className={`${isActive(i) ? "text-[#3586FF] " : isCompleted(i) ? "text-gray-800" : "text-gray-500"}`}
          >
            {label}
          </div>
        ))}
      </div>

      <div
        ref={containerRef}
        tabIndex={0}
        className="relative rounded-xl bg-white border border-gray-200 md:p-3 p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={count}
        aria-valuenow={onboardingSteps + 1}
        aria-label="Onboarding progress"
      >
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[3px] bg-gray-200 rounded-[6px]" />

        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 h-[3px] bg-[#5297ff] rounded-full transition-[width] duration-300"
          style={{ width: `calc(${progressPercent}% - 0px)`, maxWidth: "calc(100% - 3rem)" }}
        />

        <ol className="relative grid grid-cols-4" role="list">
          {steps.map((_, i) => {
            const complete = isCompleted(i);
            const active = isActive(i);
            const showLeft = i > 0;
            const leftComplete = i - 1 < onboardingSteps;

            return (
              <li key={i} className="relative flex flex-col items-center">
                {showLeft && (
                  <span
                    aria-hidden
                    className={`absolute left-0 right-1/2 top-1/2 -translate-y-1/2 h-[3px] ${leftComplete ? "bg-[#5297ff]" : "bg-gray-200"
                      }`}
                  />
                )}
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      goTo(i);
                    }
                  }}
                  aria-current={active ? "step" : undefined}
                  aria-label={`Step ${i + 1}: ${steps[i]}`}
                  className={[
                    "relative z-[1] grid place-items-center",
                    "h-11 w-11 md:h-8 md:w-8 min-h-8 min-w-8", // touch target ~44px
                    "rounded-full border-2 transition-all duration-200",
                    active
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                      : complete
                        ? "bg-white border-blue-400 text-[#3586FF] "
                        : "bg-white border-gray-300 text-gray-600",
                    "hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-blue-300",
                  ].join(" ")}
                >
                  {complete ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <span className="font-bold text-[12px] md:text-[13px]">{i + 1}</span>
                  )}
                </button>

                {i < count - 1 && (
                  <span
                    aria-hidden
                    className={`absolute left-1/2 right-0 top-1/2 -translate-y-1/2 h-[3px] ${i < onboardingSteps ? "bg-[#5297ff]" : "bg-gray-200"
                      }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] md:text-[12px] text-gray-500">
        <span>
          Step <span className="font-bold">{onboardingSteps + 1}</span> of{" "}
          <span className="font-bold">{count}</span>
        </span>
        <span className="hidden md:block font-medium">Tip: Click or use ← → to jump.</span>
      </div>
    </div>
  );
};

export default StepperC;
