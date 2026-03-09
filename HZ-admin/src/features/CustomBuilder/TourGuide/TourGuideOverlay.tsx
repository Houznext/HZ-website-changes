import React from "react";
import { useTourGuide } from "./TourGuideProvider";
import Button from "@/src/common/Button"

// Use useEffect instead of useLayoutEffect to avoid SSR warning
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

export const TourGuideOverlay = () => {
  const { isOpen, steps, currentStep, nextStep, endTour } = useTourGuide();

  const [rect, setRect] = React.useState<DOMRect | null>(null);

  const step = steps[currentStep];

  useIsomorphicLayoutEffect(() => {
    if (!isOpen || !step?.ref?.current) {
      setRect(null);
      return;
    }

    const el = step.ref.current as HTMLElement;

    const updateRect = () => setRect(el.getBoundingClientRect());

    updateRect();

    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [isOpen, step]);

  if (!isOpen || !step || !rect) return null;

  const tooltipWidth = 270;
  const defaultLeft = rect.left + window.scrollX;
  const maxLeft = window.innerWidth - tooltipWidth - 20;
  const safeLeft = Math.min(defaultLeft, maxLeft);

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-none">
      <div className="absolute bg-black/50 inset-0 backdrop-blur-sm" />

      <div
        className="absolute border-2 border-blue-500 rounded-md shadow-lg pointer-events-auto"
        style={{
          top: rect.top - 8 + window.scrollY,
          left: rect.left - 8 + window.scrollX,
          width: rect.width + 16,
          height: rect.height + 16,
        }}
      />

      <div
        className="absolute bg-white md:p-3 p-1 rounded-md shadow-lg max-w-[270px] w-full pointer-events-auto"
        style={{
          top: rect.bottom + 12 + window.scrollY,
          left: safeLeft,
        }}
      >
        <p className="md:text-[14px] text-[12px] font-medium mb-2">
          {step.text}
        </p>

        <div className="flex justify-end gap-2">
          <Button
            className="text-[10px] font-Godita-Medium btn-text px-2 py-1 bg-gray-200 rounded"
            onClick={endTour}
          >
            Close
          </Button>

          <Button
            className="text-[10px] font-Godita-Medium btn-text px-2 py-1 bg-blue-500 text-white rounded"
            onClick={nextStep}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
