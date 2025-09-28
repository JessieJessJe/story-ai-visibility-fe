import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { UIResult } from "@/types/api";

interface ResultsSummaryProps {
  result: UIResult;
  onExport: () => void;
}

export function ResultsSummary({ result, onExport }: ResultsSummaryProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Results</h2>
          <p className="mt-1 text-sm text-slate-600">
            Story ID {" "}
            <span className="font-mono text-slate-800">{result.storyId}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Provider: {result.metadata.providerName}</Badge>
          <Badge variant={result.metadata.mode === "live" ? "success" : "warning"}>
            Mode: {result.metadata.mode}
          </Badge>
          {result.metadata.clientName ? (
            <Badge variant="default">Client: {result.metadata.clientName}</Badge>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-600">Total questions evaluated</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {result.summary.totalQuestions.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-600">Provider recognized in</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {result.summary.aiProviderRecognizedIn.toLocaleString()} responses
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button type="button" variant="secondary" onClick={onExport}>
          <Download className="h-4 w-4" aria-hidden />
          Export JSON
        </Button>
      </div>
    </section>
  );
}
