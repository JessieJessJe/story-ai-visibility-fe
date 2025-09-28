import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UIResult } from "@/types/api";

interface ResultsSummaryProps {
  result: UIResult;
  onExport: () => void;
}

export function ResultsSummary({ result, onExport }: ResultsSummaryProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">Results</h2>
        <p className="text-xs text-slate-500">
          Story ID <span className="font-mono text-slate-700">{result.storyId}</span>
        </p>
      </header>

      <div className="mt-4">
        <Button type="button" variant="secondary" onClick={onExport}>
          <Download className="h-4 w-4" aria-hidden />
          Export JSON
        </Button>
      </div>
    </section>
  );
}
