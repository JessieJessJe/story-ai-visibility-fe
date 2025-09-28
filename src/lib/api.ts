import { z } from "zod";
import type { ApiResponse, QuestionResponse, UIResult } from "@/types/api";

const questionResponseSchema = z.object({
  model: z.string(),
  answer: z.string(),
  inferred: z.boolean().optional(),
  ai_provider_inferred: z.boolean().optional()
});

const questionSchema = z.object({
  prompt: z.string(),
  category: z.string(),
  kind: z.string(),
  ai_provider_inferred: z.boolean().optional().default(false),
  id: z.string().optional(),
  assumptions: z.array(z.string()).optional().default([]),
  responses: z.array(questionResponseSchema).optional().default([])
});

const pillarSchema = z.object({
  title: z.string().optional(),
  pillar: z.string().optional(),
  summary: z.string().optional().default(""),
  ai_provider_inferred: z.boolean().optional().default(false),
  questions: z.array(questionSchema).optional().default([])
});

const summarySchema = z
  .object({
    total_questions: z.coerce.number(),
    ai_provider_recognized_in: z.coerce.number()
  })
  .or(
    z
      .object({
        totalQuestions: z.coerce.number(),
        aiProviderRecognizedIn: z.coerce.number()
      })
      .transform(({ totalQuestions, aiProviderRecognizedIn }) => ({
        total_questions: totalQuestions,
        ai_provider_recognized_in: aiProviderRecognizedIn
      }))
  );

const metadataSchema = z
  .object({
    client_name: z.string().nullable(),
    provider_name: z.string(),
    models_run: z.array(z.string()),
    mode: z.union([z.literal("stub"), z.literal("live")])
  })
  .or(
    z
      .object({
        clientName: z.string().nullable(),
        providerName: z.string(),
        modelsRun: z.array(z.string()),
        mode: z.union([z.literal("stub"), z.literal("live")])
      })
      .transform(({ clientName, providerName, modelsRun, mode }) => ({
        client_name: clientName,
        provider_name: providerName,
        models_run: modelsRun,
        mode
      }))
  );

const responseSchema = z
  .object({
    story_id: z.string(),
    summary: summarySchema,
  selling_points: z
    .array(pillarSchema)
    .optional()
    .default([]),
  sellingPoints: z
      .array(pillarSchema)
      .optional()
      .default([]),
    pillars: z
      .array(pillarSchema)
      .optional()
      .default([]),
    metadata: metadataSchema
  })
  .or(
    z.object({
      data: z.object({
        story_id: z.string(),
        summary: summarySchema,
        selling_points: z
          .array(pillarSchema)
          .optional()
          .default([]),
        sellingPoints: z
          .array(pillarSchema)
          .optional()
          .default([]),
        pillars: z
          .array(pillarSchema)
          .optional()
          .default([]),
        metadata: metadataSchema
      })
    })
  )
  .transform((payload) => ("data" in payload ? payload.data : payload));

export type AnalyzeRequestPayload = {
  text: string;
  provider_name: string;
  provider_aliases: string[];
};

export function normalizeApiResponsePayload(raw: unknown): ApiResponse {
  const parsed = responseSchema.safeParse(raw);

  if (!parsed.success) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Unexpected /analyze response", raw, parsed.error.flatten());
    }
    throw new Error("Received unexpected response format from API");
  }
  const data = parsed.data as ApiResponse;
  const camelCasePillars = (parsed.data as { sellingPoints?: ApiResponse["selling_points"] })
    .sellingPoints;

  if ((!data.selling_points || data.selling_points.length === 0) && camelCasePillars?.length) {
    data.selling_points = camelCasePillars;
  }

  return data;
}

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
  if (process.env.NODE_ENV !== "production") {
    console.log("/analyze response", json);
  }
  const normalized = normalizeApiResponsePayload(json);

  return adaptApiResponse(normalized);
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
      title: pillar.pillar ?? "Untitled pillar",
      summary: pillar.summary ?? "",
      aiProviderInferred: pillar.ai_provider_inferred ?? false,
      questions: (pillar.questions ?? []).map((question) => ({
        prompt: question.prompt,
        category: question.category,
        kind: question.kind,
        aiProviderInferred: question.ai_provider_inferred ?? false,
        assumptions: question.assumptions,
        id: question.id,
        responses: normalizeResponses(question.responses ?? [])
      }))
    }))
  };
}

function normalizeResponses(responses: QuestionResponse[]): QuestionResponse[] {
  return responses.map((response) => {
    const inferredFlag =
      response.ai_provider_inferred ?? response.inferred ?? false;

    return {
      model: response.model,
      answer: response.answer,
      inferred: inferredFlag
    };
  });
}

function resolvePillars(data: ApiResponse & { sellingPoints?: ApiResponse["selling_points"] }) {
  const sellingPoints = data.selling_points ?? data.sellingPoints ?? [];
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
