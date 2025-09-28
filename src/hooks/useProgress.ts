import { useEffect, useRef, useState } from "react";
import type { ProgressStep } from "@/types/api";

const PROGRESS_ORDER: ProgressStep[] = [
  "mask",
  "pillars",
  "questions",
  "models",
  "evaluate"
];

export function useSimulatedProgress(isActive: boolean) {
  const [percentage, setPercentage] = useState(0);
  const [currentStep, setCurrentStep] = useState<ProgressStep>("mask");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = null;
      setPercentage(0);
      setCurrentStep("mask");
      return;
    }

    intervalRef.current = setInterval(() => {
      setPercentage((previous) => {
        const next = Math.min(previous + 20, 95);
        const index = Math.min(
          Math.floor(next / (100 / PROGRESS_ORDER.length)),
          PROGRESS_ORDER.length - 1
        );
        setCurrentStep(PROGRESS_ORDER[index]);
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  const complete = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = null;
    setPercentage(100);
    setCurrentStep("evaluate");
  };

  return { percentage, currentStep, complete, steps: PROGRESS_ORDER };
}
