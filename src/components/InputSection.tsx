import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface InputSectionProps {
  text: string;
  providerName: string;
  providerAliases: string[];
  isLoading: boolean;
  onTextChange: (value: string) => void;
  onProviderNameChange: (value: string) => void;
  onProviderAliasesChange: (values: string[]) => void;
  onAnalyze: () => void;
  onLoadSample?: () => void;
  showLoadSampleButton?: boolean;
}

export function InputSection({
  text,
  providerName,
  providerAliases,
  isLoading,
  onTextChange,
  onProviderNameChange,
  onProviderAliasesChange,
  onAnalyze,
  onLoadSample,
  showLoadSampleButton = false
}: InputSectionProps) {
  const [aliasDraft, setAliasDraft] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const canSubmit = text.trim().length > 0 && !isLoading;

  const addAlias = () => {
    const candidate = aliasDraft.trim();
    if (!candidate) return;
    if (providerAliases.includes(candidate)) {
      setAliasDraft("");
      return;
    }
    onProviderAliasesChange([...providerAliases, candidate]);
    setAliasDraft("");
  };

  const removeAlias = (alias: string) => {
    onProviderAliasesChange(providerAliases.filter((item) => item !== alias));
  };

  const handleAliasKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addAlias();
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Transcript</h2>
        {showLoadSampleButton && onLoadSample ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onLoadSample}
            disabled={isLoading}
          >
            Load sample
          </Button>
        ) : null}
      </div>
      <div>
        <textarea
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          disabled={isLoading}
          placeholder="Paste your story transcript here..."
          className="min-h-[220px] w-full resize-y rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed"
        />
        <div className="mt-1 text-right text-xs text-slate-500">
          {text.length.toLocaleString()} characters
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Provider masking</h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setAdvancedOpen((value) => !value)}
          >
            {advancedOpen ? "Hide advanced" : "Advanced masking"}
          </Button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Provider name
            </label>
            <input
              value={providerName}
              onChange={(event) => onProviderNameChange(event.target.value)}
              disabled={isLoading}
              placeholder="OpenAI"
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Provider aliases
            </label>
            <div className="flex items-center gap-2">
              <input
                value={aliasDraft}
                onChange={(event) => setAliasDraft(event.target.value)}
                onKeyDown={handleAliasKeyDown}
                disabled={isLoading}
                placeholder="Add alias and press Enter"
                className="h-10 flex-1 rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed"
              />
              <Button type="button" variant="secondary" size="sm" onClick={addAlias} disabled={isLoading}>
                <Plus className="h-4 w-4" aria-hidden />
                <span className="sr-only">Add alias</span>
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {providerAliases.map((alias) => (
                <Badge
                  key={alias}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  {alias}
                  <button
                    type="button"
                    onClick={() => removeAlias(alias)}
                    className="rounded-full p-0.5 text-slate-500 hover:bg-slate-200"
                    aria-label={`Remove alias ${alias}`}
                    disabled={isLoading}
                  >
                    <X className="h-3 w-3" aria-hidden />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {advancedOpen ? (
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>
              Advanced masking replaces occurrences of provider aliases before
              sending transcripts to the backend. This helps reduce bias when
              evaluating language models.
            </p>
            <p>
              Customize aliases to reflect the ways your team references the
              provider in writing.
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button
          type="button"
          size="lg"
          onClick={onAnalyze}
          disabled={!canSubmit}
        >
          {isLoading ? "Analyzing…" : "Analyze"}
        </Button>
      </div>
    </section>
  );
}
