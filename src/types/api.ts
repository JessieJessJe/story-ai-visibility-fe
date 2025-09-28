export type AnalysisState = "idle" | "loading" | "success" | "error";
export type ProgressStep = "mask" | "pillars" | "questions" | "models" | "evaluate";

export interface ApiSummary {
  total_questions: number;
  ai_provider_recognized_in: number;
}

export interface ApiResponse {
  story_id: string;
  summary: ApiSummary;
  selling_points?: SellingPoint[];
  pillars?: SellingPoint[];
  metadata: {
    client_name: string | null;
    provider_name: string;
    models_run: string[];
    mode: "stub" | "live";
  };
}

export interface SellingPoint {
  title: string;
  summary: string;
  ai_provider_inferred?: boolean;
  questions?: QuestionEntry[];
}

export interface QuestionEntry {
  prompt: string;
  category: string;
  kind: string;
  ai_provider_inferred?: boolean;
  responses?: QuestionResponse[];
}

export interface QuestionResponse {
  model: string;
  answer: string;
  inferred?: boolean;
}

export interface UIResult {
  storyId: string;
  summary: {
    totalQuestions: number;
    aiProviderRecognizedIn: number;
  };
  models: string[];
  pillars: PillarResult[];
  metadata: {
    clientName: string | null;
    providerName: string;
    mode: "stub" | "live";
  };
}

export interface PillarResult {
  title: string;
  summary: string;
  aiProviderInferred: boolean;
  questions: QuestionDetail[];
}

export interface QuestionDetail {
  prompt: string;
  category: string;
  kind: string;
  aiProviderInferred: boolean;
  responses: QuestionResponse[];
}
