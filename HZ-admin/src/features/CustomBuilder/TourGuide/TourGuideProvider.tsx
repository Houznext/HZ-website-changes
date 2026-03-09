import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { TourGuideOverlay } from "./TourGuideOverlay";

const TourGuideContext = createContext<any>(null);

export const TourGuideProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

 const registerStep = React.useCallback((step: any) => {
  setSteps((prev) => {
    const existingIdx = prev.findIndex((s) => s.order === step.order);
    if (existingIdx !== -1) {
      const copy = [...prev];
      copy[existingIdx] = step;
      return copy.sort((a, b) => a.order - b.order);
    }
    return [...prev, step].sort((a, b) => a.order - b.order);
  });
}, []);


const startTour = () => {
  setCurrentStep(0);

  setTimeout(() => {
    setIsOpen(true);
  }, 50); // ensures DOM + refs ready
};


  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    else setIsOpen(false);
  };

  const endTour = () => {
    setIsOpen(false);
  };

  const value = {
    registerStep,
    startTour,
    nextStep,
    endTour,
    isOpen,
    currentStep,
    steps,
  };

  return (
    <TourGuideContext.Provider value={value}>
      {children}
      <TourGuideOverlay />
    </TourGuideContext.Provider>
  );
};

export const useTourGuide = () => useContext(TourGuideContext);
