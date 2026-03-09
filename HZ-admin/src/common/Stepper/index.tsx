import React from "react";

interface FormStepperProps {
  currentStep: number;
  onStepClick?: (stepIndex: number) => void; 
  steps: Array<string>;
  classNames?: {
    stepCircle?: string;
    stepLabel?: string;
    line?: string;
    container?: string;
  };
}

export const Stepper = ({ currentStep, steps, classNames , onStepClick}: FormStepperProps) => {
  return (
    <div className={classNames?.container || ''}>
      <ol className="flex items-center bg-white px-2 py-1 rounded-md shadow-sm">
        {steps.map((item, index, stepsArray) => {
          return (
            <li
              className={`flex ${index !== stepsArray.length - 1 ? "w-full" : "w-fit"} items-center`}
              key={index}
            >
              <div className="relative flex w-full">
                <div className="relative flex flex-col gap-[10px] items-center cursor-pointer"
                 onClick={() => onStepClick?.(index)}>
                  <span
                    className={`flex  h-3 w-3 shrink-0 items-center md:text-[16px] text-[11px] justify-center rounded-full md:h-6 md:w-6 ${currentStep >= index ? "bg-[#3586FF] text-white border-0" : "bg-gray-400 text-[white] border border-[#7B7C83]"} text-base font-medium ${classNames?.stepCircle}`}
                  >
                    {index + 1}
                  </span>
                  <span
                    className={`absolute bottom-[40px] text-[10px] md:text-[16px] max-md:text-center md:whitespace-nowrap ${currentStep === index ? "text-[#3586FF] font-bold" : "text-[#797979] font-medium "} font-medium ${classNames?.stepLabel}`}
                  >
                    {item}
                  </span>
                </div>
                {index !== stepsArray.length - 1 && (
                  <div className="flex w-full  items-center justify-center">
                    <div
                      className={`h-[2px] w-[100%] rounded ${currentStep > index ? "bg-[#3586FF]" : "bg-[#8f8e8e]"
                        }`}
                    ></div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
