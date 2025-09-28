import type { ProgressStep } from "@/types/api";
import { Badge } from "@/components/ui/badge";

const STEP_LABELS: Record<ProgressStep, string> = {
  mask: "Mask aliases",
  pillars: "Analyze pillars",
  questions: "Score questions",
  models: "Compare models",
  evaluate: "Evaluate impact"
};

interface ProgressStateProps {
  percentage: number;
  currentStep: ProgressStep;
  steps: ProgressStep[];
  isActive: boolean;
}

export function ProgressState({ percentage, currentStep, steps, isActive }: ProgressStateProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Analysis progress</h2>
        <Badge variant={isActive ? "default" : "success"}>{isActive ? "Running" : "Complete"}</Badge>
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <ol className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-5">
        {steps.map((step) => {
          const index = steps.indexOf(step);
          const isComplete = percentage >= ((index + 1) / steps.length) * 100;
          const isCurrent = currentStep === step;

          return (
            <li
              key={step}
              className={
                isComplete
                  ? "rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500"
                  : isCurrent
                  ? "rounded-md border border-accent/40 bg-accent/10 px-3 py-2 font-medium text-emerald-700"
                  : "rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
              }
            >
              {STEP_LABELS[step]}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
