import { ReactNode } from "react";
import Button from "../Button";

type StepperProps = {
  currentStep: number;
  steps: string[];
  handleClick: (index: number) => () => void;
  iconMap?: Record<string, ReactNode>;
};

const Stepper = ({ currentStep, steps, handleClick, iconMap }: StepperProps) => {
  return (
    <div className="w-full mx-auto">
      <div className="flex w-full max-w-3xl mx-auto items-start justify-between gap-0 px-2 py-1 overflow-x-auto no-scrollbar">
        {steps.map((step, index) => {
          const isActive = currentStep === index;
          const isCompleted = currentStep > index;
          const icon = iconMap?.[step];

          return (
            <div key={step} className="relative flex-1 flex flex-col items-center">
              {index < steps.length - 1 && (
                <div className="absolute top-5 left-1/2 w-full h-[2px] bg-gray-200">
                  <div
                    className={[
                      "h-[2px] transition-all",
                      isCompleted ? "w-full bg-[#3586FF]" : "w-0 bg-[#3586FF]",
                    ].join(" ")}
                  />
                </div>
              )}

              <Button
                onClick={handleClick(index)}
                className="flex flex-col items-center gap-1 text-[11px] md:text-xs focus:outline-none z-10"
              >
                <div
                  className={[
                    "flex h-6 w-6 md:h-10 md:w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-all",
                    isActive
                      ? "border-[#3586FF] bg-blue-50 text-[#3586FF] shadow-sm"
                      : isCompleted
                        ? "border-[#3586FF] bg-[#3586FF] text-white"
                        : "border-gray-300 bg-white text-gray-500",
                  ].join(" ")}
                >
                  {icon ?? <span>{index + 1}</span>}
                </div>

                <span
                  className={[
                    "whitespace-nowrap font-medium",
                    isActive
                      ? "text-[#3586FF]"
                      : isCompleted
                        ? "text-gray-800"
                        : "text-gray-500",
                  ].join(" ")}
                >
                  {step}
                </span>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;
