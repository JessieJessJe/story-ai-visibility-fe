import type { UIResult } from "@/types/api";
import { ResultsSummary } from "./ResultsSummary";
import { ModelComparison } from "./ModelComparison";
import { PillarCards } from "./PillarCards";

interface ResultsSectionProps {
  result: UIResult;
  onExport: () => void;
}

export function ResultsSection({ result, onExport }: ResultsSectionProps) {
  return (
    <section className="space-y-6">
      <ResultsSummary result={result} onExport={onExport} />
      <ModelComparison models={result.models} pillars={result.pillars} />
      <PillarCards pillars={result.pillars} />
    </section>
  );
}
