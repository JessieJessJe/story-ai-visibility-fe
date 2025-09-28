import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResultsSection } from "@/components/results/ResultsSection";
import type { UIResult } from "@/types/api";

const mockResult: UIResult = {
  storyId: "story-789",
  summary: {
    totalQuestions: 10,
    aiProviderRecognizedIn: 7
  },
  models: ["gpt-4o", "claude"],
  metadata: {
    clientName: "Acme",
    providerName: "OpenAI",
    mode: "live"
  },
  pillars: [
    {
      title: "Trust",
      summary: "Customers reference the provider often",
      aiProviderInferred: true,
      questions: [
        {
          prompt: "Trust prompt",
          category: "awareness",
          kind: "open",
          aiProviderInferred: true,
          responses: [
            { model: "gpt-4o", answer: "OpenAI appears", inferred: true }
          ]
        }
      ]
    }
  ]
};

describe("ResultsSection", () => {
  it("renders summary stats and model comparison", () => {
    render(<ResultsSection result={mockResult} onExport={jest.fn()} />);

    expect(screen.getByText(/story-789/i)).toBeInTheDocument();
    expect(screen.getByText(/Total questions evaluated/i)).toBeInTheDocument();
    expect(screen.getByText(/OpenAI appears/i)).toBeInTheDocument();
    const modelOccurrences = screen.getAllByText(/gpt-4o/i);
    expect(modelOccurrences.length).toBeGreaterThan(0);
  });

  it("invokes export callback when clicking Export JSON", async () => {
    const user = userEvent.setup();
    const onExport = jest.fn();
    render(<ResultsSection result={mockResult} onExport={onExport} />);

    await user.click(screen.getByRole("button", { name: /export json/i }));

    expect(onExport).toHaveBeenCalled();
  });
});
