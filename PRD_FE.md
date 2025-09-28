# Brand Visibility UI — Frontend PRD

## 1. Overview

Build a Next.js + TypeScript frontend (`story-ui-visibility-fe`) that sends narrative transcripts to the `/analyze` backend endpoint, visualizes brand-visibility analysis, and lets users configure provider masking before running the pipeline.

Backend contract recap:
- `POST /analyze` returns `story_id`, `metadata`, `summary`, and a `selling_points` array. Each selling point uses the field `pillar` for its name, contains an optional `summary`, and includes follow-up questions with per-model responses.
- `GET /health` returns `{ ok: true }`.

## 2. Tech Stack

- Framework: Next.js 14 (App Router) + React 18
- Language: TypeScript
- Styling: Tailwind CSS, custom shadcn-style primitives
- Icons: Lucide React
- State: Local state with React hooks (no global store)
- API layer: `fetch` + Zod validation in `src/lib/api.ts`

## 3. Pages & Routing

- Single-page experience at `/`.
- Future ideas (not implemented): `/sample`, `/history`.

## 4. Core Features

1. **Transcript Input**
   - Large textarea with character counter and empty-check validation.
   - Optional “Load sample” button (gated by `NEXT_PUBLIC_SHOW_SAMPLE_BUTTON`).
2. **Provider Configuration**
   - Inputs for `provider_name` and aliases (defaulted from env).
   - Collapsible “Advanced masking” helper copy.
3. **Analysis Trigger**
   - “Analyze” button fires `fetchAnalysis` and disables inputs while running.
4. **Progress Indicator**
   - Local 5-step simulation (mask → pillars → questions → models → evaluate) that ticks every second while awaiting API.
5. **Results Visualization**
   - Summary cards for `summary.total_questions` and `summary.ai_provider_recognized_in`.
   - Model comparison visualizes inference accuracy: overall per-model percentage bars plus a pillar × model heat map (color-coded by inference rate).
   - Pillar cards show `selling_points[].pillar` as the title, optional summary, the masked question prompt/assumptions, and individual model answer accordions (model badge, inference badge, copy control, and expanded answer text).
   - Inference badges derived from `responses[].ai_provider_inferred`.
   - Metadata badges for `provider_name`, `client_name`, `mode`, and `story_id`.
6. **Error Handling**
   - Friendly message plus retry call-to-action for non-OK responses or validation failures.
7. **Utilities**
   - Copy-to-clipboard buttons for answers (Clipboard API).
   - Export JSON button downloads the normalized UI result.

## 5. API Integration & Normalization

- API base URL sourced from `NEXT_PUBLIC_API_URL`.
- Request payload:
  ```json
  {
    "text": "...",
    "provider_name": "...",
    "provider_aliases": ["..."]
  }
  ```
- `fetchAnalysis` handles `AbortSignal`, throws descriptive errors (including tailored 504 message), and depends on `normalizeApiResponsePayload` to coerce backend responses.
- Normalization features:
  - Accepts snake_case (`selling_points`) or camelCase (`sellingPoints`) keys and optional `{ data: { ... } }` wrapper objects.
  - Maps `selling_points[].pillar` to the UI pillar title. No `title` field is expected from the backend.
  - Preserves optional `summary`, `assumptions`, and `id` fields on questions.
  - Derives the `inferred` boolean from either `responses[].inferred` or `responses[].ai_provider_inferred`.
  - Carries through `metadata.models_run`, `metadata.mode`, and other known fields; ignores unknown extras like `scores`.
  - Development-only `console.log('/analyze response', payload)` and `console.error` guards remain to inspect raw payloads when validation fails.
  - **CORS dependency**: the FastAPI backend must allow the deployed origin (e.g., `https://story-ai-visibility-fe.vercel.app`) via `Access-Control-Allow-Origin` for production requests to succeed.

### UIResult shape (post-normalization)

```ts
interface UIResult {
  storyId: string;
  summary: {
    totalQuestions: number;
    aiProviderRecognizedIn: number;
  };
  models: string[];
  metadata: {
    clientName: string | null;
    providerName: string;
    mode: 'stub' | 'live';
  };
  pillars: Array<{
    title: string; // from backend `pillar`
    summary: string;
    aiProviderInferred: boolean;
    questions: Array<{
      id?: string;
      prompt: string;
      category: string;
      kind: string;
      aiProviderInferred: boolean;
      assumptions?: string[];
      responses: Array<{
        model: string;
        answer: string;
        inferred: boolean;
      }>;
    }>;
  }>;
}
```

## 6. State & Hooks

- `AnalysisState` enum: `'idle' | 'loading' | 'success' | 'error'`.
- `useSimulatedProgress(isActive)` returns `{ percentage, currentStep, steps, complete }` and caps at 95% until completion.

## 7. Components

- `Header`, `Footer`
- `InputSection`
- `ProgressState`
- `ResultsSection` (with `ResultsSummary`, `ModelComparison`, `PillarCards`)
- `ErrorState`
- Minimal UI primitives in `src/components/ui`.

## 8. Styling & UX

- Tailwind palette defines `primary`, `accent`, `danger` colors.
- Layout responsive: single column on mobile, two-column spacing on desktop.
- Icons from Lucide (spinner, info, download, clipboard, check, etc.).

## 9. Testing

- `npm test` runs Jest + React Testing Library.
  - Adapter tests cover snake_case, camelCase, data-wrapper, pillars-only, and real backend payload variants.
  - Component test ensures `ResultsSection` renders summaries and handles export callback.
- ESLint/Tailwind not automated; run `npm run lint` manually before commits if possible.

## 10. Environment & Build

- Key env vars: `NEXT_PUBLIC_API_URL`, optional `NEXT_PUBLIC_DEFAULT_PROVIDER_NAME`, `NEXT_PUBLIC_DEFAULT_PROVIDER_ALIASES`, `NEXT_PUBLIC_SHOW_SAMPLE_BUTTON`.
- Scripts: `npm run dev`, `npm run build`, `npm run lint`, `npm run test`.
- `tsconfig.json` sets `baseUrl: "."` so the `@/*` alias resolves correctly on CI/build servers (required for Vercel).
- App is deployable to Vercel; configure rewrites or call Railway backend directly.
- `.env.local.example` documents expected local settings.

## 11. Non-Goals (v0)

- Authentication, rate limiting, history persistence.
- Real-time streaming updates.
- Multi-language support.
- Saved configurations / user accounts.

## 12. Future Enhancements (Nice-to-haves)

- Persist past analyses (local storage or backend).
- Authentication + usage quotas.
- Real-time backend progress updates.
- Richer visualizations (charting library).

## 13. Incident Log / Known Issues

- **Invalid character build failure (Jan 2025)**: An earlier automated search/replace inserted the literal sequence `\u000a` into `src/lib/api.ts`, causing Next.js to report “Invalid character in identifier.” If similar work is required, prefer multiline edits via `apply_patch` or template literals instead of injecting escaped control characters.
- **Path alias resolution on Vercel (Jan 2025)**: Deploys initially failed with `Module not found: Can't resolve '@/components/...` because `baseUrl` wasn’t defined. Adding `"baseUrl": "."` to `tsconfig.json` resolved the issue.
- **DevTools well-known probe (Jan 2025)**: Chrome requests `/.well-known/appspecific/com.chrome.devtools.json` in development; provide a placeholder JSON in `public/.well-known/appspecific/` to avoid 500 errors.
- **CORS configuration (Jan 2025)**: Production requests were blocked until the backend added the Vercel origin to its CORS allowlist. Ensure backend `CORSMiddleware` includes both `http://localhost:3000` and the deployed FE domain.
- Keep dev-only logging until QA confirms the contract is stable.
