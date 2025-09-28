import { useMemo } from "react";
import type { PillarResult } from "@/types/api";
import { Badge } from "@/components/ui/badge";

interface ModelComparisonProps {
  models: string[];
  pillars: PillarResult[];
}

export function ModelComparison({ models, pillars }: ModelComparisonProps) {
  const counts = useMemo(() => {
    const tally = new Map<string, number>();
    for (const model of models) {
      tally.set(model, 0);
    }

    for (const pillar of pillars) {
      for (const question of pillar.questions) {
        for (const response of question.responses) {
          tally.set(response.model, (tally.get(response.model) ?? 0) + 1);
        }
      }
    }

    return Array.from(tally.entries()).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));
  }, [models, pillars]);

  if (!counts.length) {
    return null;
  }

  const max = counts[0]?.[1] ?? 1;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Model comparison</h3>
        <Badge variant="outline">{models.length} models</Badge>
      </div>
      <div className="mt-4 space-y-3">
        {counts.map(([model, value]) => (
          <div key={model}>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span className="font-medium text-slate-800">{model}</span>
              <span>{value} responses</span>
            </div>
            <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-accent transition-all"
                style={{ width: `${Math.max((value / max) * 100, 5)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
