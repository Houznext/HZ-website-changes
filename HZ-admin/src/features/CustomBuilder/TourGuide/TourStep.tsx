import { useEffect } from "react";
import { useTourGuide } from "./TourGuideProvider";

export const TourStep = ({
  order,
  text,
  targetRef,
}: {
  order: number;
  text: string;
  targetRef: any;
}) => {
  const { registerStep } = useTourGuide();

  useEffect(() => {
    registerStep({ order, text, ref: targetRef });
  }, [order, text, targetRef, registerStep]);

  return null;
};

