import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Clipboard, ClipboardCheck } from "lucide-react";
import type { PillarResult, QuestionDetail } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PillarCardsProps {
  pillars: PillarResult[];
}

export function PillarCards({ pillars }: PillarCardsProps) {
  if (!pillars.length) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h3 className="text-base font-semibold text-slate-900">Pillars</h3>
      <div className="grid gap-4 lg:grid-cols-2">
        {pillars.map((pillar) => (
          <article
            key={pillar.title}
            className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <header className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">{pillar.title}</h4>
                <p className="mt-1 text-sm text-slate-600">{pillar.summary}</p>
              </div>
              <Badge variant={pillar.aiProviderInferred ? "success" : "outline"}>
                {pillar.aiProviderInferred ? "✔ inferred" : "✖ not inferred"}
              </Badge>
            </header>
            <div className="space-y-4">
              {pillar.questions.map((question) => (
                <QuestionBlock key={question.prompt} question={question} pillarTitle={pillar.title} />
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

interface QuestionBlockProps {
  question: QuestionDetail;
  pillarTitle: string;
}

function QuestionBlock({ question, pillarTitle }: QuestionBlockProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="space-y-3">
        <header className="space-y-1">
          <p className="text-sm font-medium text-slate-800">{question.prompt}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <Badge variant="outline">Category: {question.category}</Badge>
            <Badge variant="outline">Kind: {question.kind}</Badge>
            <Badge variant={question.aiProviderInferred ? "success" : "outline"}>
              {question.aiProviderInferred ? "✔ provider inferred" : "✖ provider hidden"}
            </Badge>
          </div>
          {question.assumptions?.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-600">
              {question.assumptions.map((assumption, index) => (
                <li key={`${pillarTitle}-${question.id ?? question.prompt}-assumption-${index}`}>
                  {assumption}
                </li>
              ))}
            </ul>
          ) : null}
        </header>

        <div className="space-y-3">
          {question.responses.map((response) => (
            <ModelResponse
              key={`${question.prompt}-${response.model}`}
              model={response.model}
              answer={response.answer}
              inferred={response.inferred ?? false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ModelResponseProps {
  model: string;
  answer: string;
  inferred: boolean;
}

function ModelResponse({ model, answer, inferred }: ModelResponseProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy", error);
    }
  };

  return (
    <div className="rounded-md border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">{model}</span>
          <Badge variant={inferred ? "success" : "outline"}>
            {inferred ? <Check className="mr-1 h-3 w-3" aria-hidden /> : null}
            {inferred ? "Inferred" : "Not inferred"}
          </Badge>
        </div>
        <span className="flex items-center gap-2 text-xs text-slate-500">
          {expanded ? "Hide answer" : "Show answer"}
          {expanded ? <ChevronUp className="h-4 w-4" aria-hidden /> : <ChevronDown className="h-4 w-4" aria-hidden />}
        </span>
      </button>
      {expanded ? (
        <div className="space-y-2 px-3 pb-3 pt-1">
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{answer}</p>
          <div className="flex justify-end">
            <Button type="button" size="sm" variant="secondary" onClick={handleCopy}>
              {copied ? (
                <ClipboardCheck className="h-4 w-4" aria-hidden />
              ) : (
                <Clipboard className="h-4 w-4" aria-hidden />
              )}
              Copy
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
