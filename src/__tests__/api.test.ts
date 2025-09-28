import { adaptApiResponse } from "@/lib/api";
import type { ApiResponse } from "@/types/api";

describe("adaptApiResponse", () => {
  it("normalizes API payload into UI result", () => {
    const payload: ApiResponse = {
      story_id: "story-123",
      summary: {
        total_questions: 5,
        ai_provider_recognized_in: 3
      },
      selling_points: [
        {
          title: "Trust",
          summary: "Highlights brand trust",
          ai_provider_inferred: true,
          questions: [
            {
              prompt: "How is provider referenced?",
              category: "awareness",
              kind: "multiple-choice",
              ai_provider_inferred: true,
              responses: [
                {
                  model: "gpt-4o",
                  answer: "OpenAI is mentioned explicitly",
                  inferred: true
                }
              ]
            }
          ]
        }
      ],
      metadata: {
        client_name: "Acme",
        provider_name: "OpenAI",
        models_run: ["gpt-4o"],
        mode: "live"
      }
    };

    const result = adaptApiResponse(payload);

    expect(result).toEqual({
      storyId: "story-123",
      summary: {
        totalQuestions: 5,
        aiProviderRecognizedIn: 3
      },
      models: ["gpt-4o"],
      metadata: {
        clientName: "Acme",
        providerName: "OpenAI",
        mode: "live"
      },
      pillars: [
        {
          title: "Trust",
          summary: "Highlights brand trust",
          aiProviderInferred: true,
          questions: [
            {
              prompt: "How is provider referenced?",
              category: "awareness",
              kind: "multiple-choice",
              aiProviderInferred: true,
              responses: [
                {
                  model: "gpt-4o",
                  answer: "OpenAI is mentioned explicitly",
                  inferred: true
                }
              ]
            }
          ]
        }
      ]
    });
  });

  it("defaults optional booleans to false", () => {
    const payload: ApiResponse = {
      story_id: "story-456",
      summary: {
        total_questions: 2,
        ai_provider_recognized_in: 0
      },
      selling_points: [
        {
          title: "Scale",
          summary: "",
          ai_provider_inferred: undefined,
          questions: [
            {
              prompt: "",
              category: "",
              kind: "",
              ai_provider_inferred: undefined,
              responses: [
                {
                  model: "claude",
                  answer: "",
                  inferred: undefined
                }
              ]
            }
          ]
        }
      ],
      metadata: {
        client_name: null,
        provider_name: "Anthropic",
        models_run: ["claude"],
        mode: "stub"
      }
    };

    const result = adaptApiResponse(payload);

    expect(result.pillars[0].aiProviderInferred).toBe(false);
    expect(result.pillars[0].questions[0].aiProviderInferred).toBe(false);
      expect(result.pillars[0].questions[0].responses[0].inferred).toBe(false);
    });

  it("supports fallback pillars array when selling_points absent", () => {
    const payload: ApiResponse = {
      story_id: "story-789",
      summary: {
        total_questions: 1,
        ai_provider_recognized_in: 1
      },
      pillars: [
        {
          title: "Awareness",
          summary: "",
          questions: [
            {
              prompt: "Prompt",
              category: "cat",
              kind: "open",
              responses: [
                { model: "gpt-4o", answer: "Answer" }
              ]
            }
          ]
        }
      ],
      metadata: {
        client_name: null,
        provider_name: "OpenAI",
        models_run: ["gpt-4o"],
        mode: "live"
      }
    };

    const result = adaptApiResponse(payload);

    expect(result.pillars).toHaveLength(1);
    expect(result.pillars[0].title).toBe("Awareness");
    expect(result.pillars[0].questions[0].responses[0].model).toBe("gpt-4o");
  });
});
