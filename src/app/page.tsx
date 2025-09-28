"use client";

import { useCallback, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { InputSection } from "@/components/InputSection";
import { ProgressState } from "@/components/ProgressState";
import { ResultsSection } from "@/components/results/ResultsSection";
import { ErrorState } from "@/components/ErrorState";
import { useSimulatedProgress } from "@/hooks/useProgress";
import { fetchAnalysis } from "@/lib/api";
import type { AnalysisState, UIResult } from "@/types/api";

const DEFAULT_PROVIDER_NAME = process.env.NEXT_PUBLIC_DEFAULT_PROVIDER_NAME ?? "OpenAI";
const DEFAULT_PROVIDER_ALIASES = (process.env.NEXT_PUBLIC_DEFAULT_PROVIDER_ALIASES ??
  "OpenAI, Open AI, OpenAI Inc., ChatGPT, GPT-4o, GPT-5, Sora, DALL-E")
  .split(",")
  .map((alias) => alias.trim())
  .filter(Boolean);
const SAMPLE_TEXT = `OpenAI has released new features in ChatGPT. The GPT-4o model is now integrated\nwith the latest Sora updates, providing enhanced multimodal capabilities. Customers of OpenAI Inc.\nare reporting improved results when using ChatGPT across creative workflows.`;
const SHOW_SAMPLE_BUTTON = (process.env.NEXT_PUBLIC_SHOW_SAMPLE_BUTTON ?? "false") === "true";

export default function Page() {
  const [text, setText] = useState("");
  const [providerName, setProviderName] = useState(DEFAULT_PROVIDER_NAME);
  const [providerAliases, setProviderAliases] = useState<string[]>(DEFAULT_PROVIDER_ALIASES);
  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<UIResult | null>(null);

  const { percentage, currentStep, steps, complete } = useSimulatedProgress(analysisState === "loading");

  const runAnalysis = useCallback(async () => {
    if (!text.trim()) {
      setErrorMessage("Transcript cannot be empty");
      setAnalysisState("error");
      return;
    }

    setAnalysisState("loading");
    setErrorMessage(null);

    try {
      const response = await fetchAnalysis({
        text,
        provider_name: providerName,
        provider_aliases: providerAliases
      });
      complete();
      setResult(response);
      setAnalysisState("success");
    } catch (error) {
      setAnalysisState("error");
      setResult(null);
      setErrorMessage(
        error instanceof Error ? error.message : "Unexpected error while analyzing transcript"
      );
    }
  }, [text, providerName, providerAliases, complete]);

  const handleRetry = () => {
    setAnalysisState("idle");
    setErrorMessage(null);
  };

  const handleExport = useCallback(() => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analysis-${result.storyId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [result]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-6 py-8">
        <InputSection
          text={text}
          providerName={providerName}
          providerAliases={providerAliases}
          isLoading={analysisState === "loading"}
          onTextChange={setText}
          onProviderNameChange={setProviderName}
          onProviderAliasesChange={setProviderAliases}
          onAnalyze={runAnalysis}
          onLoadSample={SHOW_SAMPLE_BUTTON ? () => setText(SAMPLE_TEXT) : undefined}
          showLoadSampleButton={SHOW_SAMPLE_BUTTON}
        />

        {analysisState !== "idle" ? (
          <ProgressState
            percentage={percentage}
            currentStep={currentStep}
            steps={steps}
            isActive={analysisState === "loading"}
          />
        ) : null}

        {analysisState === "error" && errorMessage ? (
          <ErrorState message={errorMessage} onRetry={handleRetry} />
        ) : null}

        {analysisState === "success" && result ? (
          <ResultsSection result={result} onExport={handleExport} />
        ) : null}

        {analysisState === "idle" && !text ? (
          <EmptyState />
        ) : null}
      </main>
      <Footer />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white/50 p-8 text-center text-sm text-slate-500">
      <AlertCircle className="mx-auto h-10 w-10 text-slate-400" aria-hidden />
      <p className="mt-3">
        Paste a transcript and configure provider masking to begin analyzing brand visibility.
      </p>
    </div>
  );
}
