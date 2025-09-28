import { adaptApiResponse, normalizeApiResponsePayload } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import { jest } from "@jest/globals";

jest.spyOn(console, "error").mockImplementation(() => undefined);
jest.spyOn(console, "log").mockImplementation(() => undefined);

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
          pillar: "Trust",
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
          pillar: "Scale",
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
          pillar: "Awareness",
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

  it("accepts camelCase summary and metadata fields", () => {
    const payload = {
      story_id: "story-999",
      summary: {
        totalQuestions: "4",
        aiProviderRecognizedIn: 2
      },
      sellingPoints: [
        {
          title: "Innovation",
          summary: "",
          ai_provider_inferred: true,
          questions: [
            {
              prompt: "Prompt",
              category: "cat",
              kind: "open",
              responses: [{ model: "gpt-4o", answer: "Answer" }]
            }
          ]
        }
      ],
      metadata: {
        clientName: null,
        providerName: "OpenAI",
        modelsRun: ["gpt-4o"],
        mode: "live"
      }
    };

    const normalized = normalizeApiResponsePayload(payload);
    expect(normalized).toHaveProperty("sellingPoints");
    expect((normalized as unknown as { sellingPoints?: unknown[] }).sellingPoints).toHaveLength(1);
    const result = adaptApiResponse(normalized);

    expect(result.summary.totalQuestions).toBe(4);
    expect(result.metadata.providerName).toBe("OpenAI");
    expect(result.pillars).toHaveLength(1);
  });

  it("prefers ai_provider_inferred when present", () => {
    const payload: ApiResponse = {
      story_id: "story-infer",
      summary: {
        total_questions: 1,
        ai_provider_recognized_in: 1
      },
      selling_points: [
        {
          pillar: "Inference",
          questions: [
            {
              prompt: "Prompt",
              category: "cat",
              kind: "open",
              responses: [
                {
                  model: "gpt-4o",
                  answer: "Answer",
                  ai_provider_inferred: true
                }
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

    expect(result.pillars[0].questions[0].responses[0].inferred).toBe(true);
  });
});

describe("normalizeApiResponsePayload variations", () => {
  const basePillar = {
    title: "Awareness",
    summary: "",
    ai_provider_inferred: false,
    questions: [
      {
        prompt: "Prompt",
        category: "cat",
        kind: "open",
        ai_provider_inferred: false,
        responses: [{ model: "gpt-4o", answer: "Answer" }]
      }
    ]
  };

  const variations: Array<[
    string,
    Record<string, unknown>
  ]> = [
    [
      "snake_case fields",
      {
        story_id: "story-1",
        summary: { total_questions: 1, ai_provider_recognized_in: 1 },
        selling_points: [basePillar],
        metadata: {
          client_name: null,
          provider_name: "OpenAI",
          models_run: ["gpt-4o"],
          mode: "live"
        }
      }
    ],
    [
      "camelCase summary/metadata",
      {
        story_id: "story-2",
        summary: { totalQuestions: "1", aiProviderRecognizedIn: "1" },
        sellingPoints: [basePillar],
        metadata: {
          clientName: null,
          providerName: "OpenAI",
          modelsRun: ["gpt-4o"],
          mode: "live"
        }
      }
    ],
    [
      "data wrapper",
      {
        data: {
          story_id: "story-3",
          summary: { total_questions: 1, ai_provider_recognized_in: 1 },
          sellingPoints: [basePillar],
          metadata: {
            clientName: null,
            providerName: "OpenAI",
            modelsRun: ["gpt-4o"],
            mode: "live"
          }
        }
      }
    ],
    [
      "pillars array only",
      {
        story_id: "story-4",
        summary: { totalQuestions: 1, aiProviderRecognizedIn: 0 },
        pillars: [basePillar],
        metadata: {
          clientName: null,
          providerName: "OpenAI",
          modelsRun: ["gpt-4o"],
          mode: "stub"
        }
      }
    ],
    [
      "real backend sample shape",
      {
        story_id: "story-7110eda4d0",
        selling_points: [
          {
            pillar: "1234",
            summary: "1234",
            questions: [
              {
                id: "sp1_q1_masked_client",
                prompt: "[MASK] reports that 1234. Which AI provider would most likely enable this outcome?",
                category: "validation",
                kind: "masked_client",
                assumptions: ["1234"],
                responses: [
                  {
                    model: "gpt-5",
                    answer:
                      "Unsure — evidence insufficient to uniquely identify the provider.\nThe excerpt provides no distinguishing signals (capabilities, evaluations, feedback loops, geography) to map to a specific vendor.",
                    ai_provider_inferred: false
                  },
                  {
                    model: "gpt-4o",
                    answer:
                      "Unsure — evidence insufficient to uniquely identify the provider. The transcript provides no information or context to determine the AI provider involved.",
                    ai_provider_inferred: false
                  }
                ]
              }
            ]
          }
        ],
        scores: {
          coverage: 0,
          confidence: 0.1
        },
        summary: {
          total_questions: 2,
          ai_provider_recognized_in: 0
        },
        metadata: {
          generated_at: "2025-09-28T04:41:23.803274",
          models_run: ["gpt-5", "gpt-4o"],
          mode: "live",
          source_url: null,
          client_name: null,
          provider_name: "OpenAI"
        }
      }
    ]
  ];

  it.each(variations)("normalizes %s payload", (_label, raw) => {
    const normalized = normalizeApiResponsePayload(raw);
    const result = adaptApiResponse(normalized);

    expect(result.storyId).toBeDefined();
    expect(result.pillars).not.toHaveLength(0);
    expect(result.models).toEqual(expect.arrayContaining(["gpt-4o"]));
  });
});
