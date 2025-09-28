import { useState } from "react";
import { Check, Clipboard, ClipboardCheck } from "lucide-react";
import type { PillarResult } from "@/types/api";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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

            <Accordion>
              {pillar.questions.map((question, index) => (
                <AccordionItem key={question.prompt} value={`${pillar.title}-${index}`}>
                  <AccordionTrigger targetValue={`${pillar.title}-${index}`}>
                    {question.prompt}
                  </AccordionTrigger>
                  <AccordionContent targetValue={`${pillar.title}-${index}`}>
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">Category: {question.category}</Badge>
                        <Badge variant="outline">Kind: {question.kind}</Badge>
                        <Badge variant={question.aiProviderInferred ? "success" : "outline"}>
                          {question.aiProviderInferred ? "✔ provider inferred" : "✖ provider hidden"}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        {question.responses.map((response) => (
                          <ResponseRow key={`${question.prompt}-${response.model}`} {...response} />
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </article>
        ))}
      </div>
    </section>
  );
}

interface ResponseRowProps {
  model: string;
  answer: string;
  inferred: boolean;
}

function ResponseRow({ model, answer, inferred }: ResponseRowProps) {
  const [copied, setCopied] = useState(false);

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
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-800">{model}</span>
          <Badge variant={inferred ? "success" : "outline"}>
            {inferred ? <Check className="mr-1 h-3 w-3" aria-hidden /> : null}
            {inferred ? "Inferred" : "Not inferred"}
          </Badge>
        </div>
        <Button type="button" size="sm" variant="secondary" onClick={handleCopy}>
          {copied ? (
            <ClipboardCheck className="h-4 w-4" aria-hidden />
          ) : (
            <Clipboard className="h-4 w-4" aria-hidden />
          )}
          Copy
        </Button>
      </div>
      <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{answer}</p>
    </div>
  );
}
