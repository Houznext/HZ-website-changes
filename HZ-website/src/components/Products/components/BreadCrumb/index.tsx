import Button from "@/common/Button";
import { RightViewArrow } from "@/components/Icons";
import Link from "next/link";
import React from "react";
import { twMerge } from "tailwind-merge";

interface BreadCrumbStep {
  label: string | React.ReactNode;
  link?: string;
  onClick?: () => void;
}

interface BreadCrumbProps {
  steps: BreadCrumbStep[];
  currentStep: string | React.ReactNode;
  className?: string;
}

const BreadCrumb = ({ steps, currentStep, className }: BreadCrumbProps) => {
  const isCurrentStep = (step: BreadCrumbStep) =>
    step.label === currentStep ||
    (typeof step.label === "string" &&
      typeof currentStep === "string" &&
      step.label.trim().toLowerCase() === currentStep.trim().toLowerCase());

  return (
    <nav
      className="w-full overflow-x-auto overflow-y-hidden scrollbar-hide"
      aria-label="Breadcrumb"
    >
      <div className="flex flex-row gap-1 md:gap-2 justify-start lg:justify-center items-center p-2 w-full mx-auto max-w-full lg:max-w-[88%] min-w-0">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex flex-row items-center flex-shrink-0 min-w-0"
          >
            <span
              className={twMerge(
                "font-medium hover:opacity-80 whitespace-nowrap",
                step.link && !isCurrentStep(step)
                  ? "cursor-pointer text-gray-800"
                  : "text-gray-800",
                isCurrentStep(step) && "text-[#3586FF]",
                className ?? "text-[12px] md:text-[14px]"
              )}
              aria-current={isCurrentStep(step) ? "page" : undefined}
            >
              {step.onClick ? (
                <Button
                  onClick={step.onClick}
                  className="text-left text-inherit bg-transparent border-none p-0 m-0 min-h-0"
                >
                  {step.label}
                </Button>
              ) : step.link && !isCurrentStep(step) ? (
                <Link href={step.link} className="hover:underline">
                  {step.label}
                </Link>
              ) : (
                <span>{step.label}</span>
              )}
            </span>

            {index < steps.length - 1 && (
              <span className="flex-shrink-0 ml-1 md:ml-0 md:mx-0.5" aria-hidden>
                <RightViewArrow />
              </span>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
};

export default BreadCrumb;
