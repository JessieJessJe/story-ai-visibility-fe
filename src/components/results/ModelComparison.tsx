import type { PillarResult } from "@/types/api";

interface ModelComparisonProps {
  models: string[];
  pillars: PillarResult[];
}

interface ModelStats {
  model: string;
  inferred: number;
  total: number;
  rate: number;
}

interface PillarModelRate {
  pillarTitle: string;
  model: string;
  rate: number;
}

export function ModelComparison({ models, pillars }: ModelComparisonProps) {
  if (!models.length || !pillars.length) {
    return null;
  }

  const modelStats = computeModelStats(models, pillars);
  const pillarStats = computePillarStats(models, pillars);

  return (
    <section className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <header className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-900">Model comparison</h3>
        <p className="text-sm text-slate-600">
          Inference rates show how often each model identified the masked provider.
        </p>
      </header>

      <div>
        <h4 className="text-sm font-medium text-slate-700">Overall inference rate</h4>
        <div className="mt-3 space-y-3">
          {modelStats.map((stat) => (
            <div key={stat.model} className="flex items-center gap-3">
              <span className="w-24 text-sm font-semibold text-slate-800">
                {stat.model}
              </span>
              <div className="h-3 flex-1 rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${getRateColor(stat.rate)}`}
                  style={{ width: `${stat.rate}%` }}
                />
              </div>
              <span className="w-16 text-right text-sm font-semibold text-slate-700">
                {Math.round(stat.rate)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-slate-700">Inference by pillar</h4>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="py-2 px-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Pillar
                </th>
                {models.map((model) => (
                  <th
                    key={model}
                    className="py-2 px-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {model}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pillarStats.map((row) => (
                <tr key={row.pillarTitle} className="border-t border-slate-200">
                  <td className="py-2 px-4 text-sm font-medium text-slate-800">
                    {row.pillarTitle}
                  </td>
                  {models.map((model) => {
                    const rate = row.modelRates[model]?.rate ?? 0;
                    return (
                      <td key={`${row.pillarTitle}-${model}`} className="py-2 px-4">
                        <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: rateColorValue(rate) }}
                        >
                          {Math.round(rate)}%
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function computeModelStats(models: string[], pillars: PillarResult[]): ModelStats[] {
  return models.map((model) => {
    let total = 0;
    let inferred = 0;

    for (const pillar of pillars) {
      for (const question of pillar.questions) {
        for (const response of question.responses) {
          if (response.model !== model) continue;
          total += 1;
          if (response.inferred) {
            inferred += 1;
          }
        }
      }
    }

    const rate = total > 0 ? (inferred / total) * 100 : 0;

    return { model, total, inferred, rate };
  });
}

function computePillarStats(models: string[], pillars: PillarResult[]) {
  return pillars.map((pillar) => {
    const modelRates: Record<string, PillarModelRate & { inferred: number; total: number }> = {};

    for (const model of models) {
      let total = 0;
      let inferred = 0;

      for (const question of pillar.questions) {
        for (const response of question.responses) {
          if (response.model !== model) continue;
          total += 1;
          if (response.inferred) {
            inferred += 1;
          }
        }
      }

      const rate = total > 0 ? (inferred / total) * 100 : 0;
      modelRates[model] = {
        pillarTitle: pillar.title,
        model,
        inferred,
        total,
        rate
      };
    }

    return {
      pillarTitle: pillar.title,
      modelRates
    };
  });
}

function getRateColor(rate: number) {
  if (rate >= 80) return "bg-emerald-500";
  if (rate >= 50) return "bg-amber-500";
  return "bg-rose-500";
}

function rateColorValue(rate: number) {
  if (rate >= 80) return "#10b981";
  if (rate >= 50) return "#f59e0b";
  return "#f43f5e";
}
