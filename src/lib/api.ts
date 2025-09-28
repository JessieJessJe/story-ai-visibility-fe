import { z } from "zod";
import type { ApiResponse, QuestionResponse, UIResult } from "@/types/api";

const questionResponseSchema = z.object({
  model: z.string(),
  answer: z.string(),
  inferred: z.boolean().optional().default(false)
});

const questionSchema = z.object({
  prompt: z.string(),
  category: z.string(),
  kind: z.string(),
  ai_provider_inferred: z.boolean().optional().default(false),
  responses: z.array(questionResponseSchema).optional().default([])
});

const pillarSchema = z.object({
  title: z.string(),
  summary: z.string().optional().default(""),
  ai_provider_inferred: z.boolean().optional().default(false),
  questions: z.array(questionSchema).optional().default([])
});

const responseSchema = z.object({
  story_id: z.string(),
  summary: z.object({
    total_questions: z.number(),
    ai_provider_recognized_in: z.number()
  }),
  selling_points: z
    .array(pillarSchema)
    .optional()
    .default([]),
  pillars: z
    .array(pillarSchema)
    .optional()
    .default([]),
  metadata: z.object({
    client_name: z.string().nullable(),
    provider_name: z.string(),
    models_run: z.array(z.string()),
    mode: z.union([z.literal("stub"), z.literal("live")])
  })
});

export type AnalyzeRequestPayload = {
  text: string;
  provider_name: string;
  provider_aliases: string[];
};

export async function fetchAnalysis(
  payload: AnalyzeRequestPayload,
  signal?: AbortSignal
): Promise<UIResult> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  if (!apiBase) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const response = await fetch(`${apiBase}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
    signal
  });

  if (!response.ok) {
    const message = await buildErrorMessage(response);
    throw new Error(message);
  }

  const json = await response.json();
  const parsed = responseSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error("Received unexpected response format from API");
  }

  return adaptApiResponse(parsed.data as ApiResponse);
}

export function adaptApiResponse(data: ApiResponse): UIResult {
  const pillarSource = resolvePillars(data);

  return {
    storyId: data.story_id,
    summary: {
      totalQuestions: data.summary.total_questions,
      aiProviderRecognizedIn: data.summary.ai_provider_recognized_in
    },
    models: data.metadata.models_run,
    metadata: {
      clientName: data.metadata.client_name,
      providerName: data.metadata.provider_name,
      mode: data.metadata.mode
    },
    pillars: pillarSource.map((pillar) => ({
      title: pillar.title,
      summary: pillar.summary ?? "",
      aiProviderInferred: pillar.ai_provider_inferred ?? false,
      questions: (pillar.questions ?? []).map((question) => ({
        prompt: question.prompt,
        category: question.category,
        kind: question.kind,
        aiProviderInferred: question.ai_provider_inferred ?? false,
        responses: normalizeResponses(question.responses ?? [])
      }))
    }))
  };
}

function normalizeResponses(responses: QuestionResponse[]): QuestionResponse[] {
  return responses.map((response) => ({
    model: response.model,
    answer: response.answer,
    inferred: response.inferred ?? false
  }));
}

function resolvePillars(data: ApiResponse) {
  const sellingPoints = data.selling_points ?? [];
  if (sellingPoints.length > 0) {
    return sellingPoints;
  }

  const pillars = data.pillars ?? [];
  return pillars;
}

async function buildErrorMessage(response: Response) {
  if (response.status === 504) {
    return "Request timed out while waiting for analysis to complete. Please try again.";
  }

  let detail = response.statusText;
  try {
    const data = await response.json();
    if (typeof data?.message === "string") {
      detail = data.message;
    }
  } catch {
    // ignore JSON parse errors
  }

  return `Analysis failed (${response.status}): ${detail}`;
}
