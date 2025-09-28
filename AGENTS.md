# Agent Handoff Notes

## Repo Snapshot
- Frontend: Next.js 14 (App Router) + TypeScript + Tailwind + shadcn-style primitives (rolled manually).
- State: client-only with React hooks (`useSimulatedProgress` for animated progress bar).
- API glue lives in `src/lib/api.ts`; types under `src/types/api.ts`.
- Tests: Jest via `ts-jest`, React Testing Library. Run `npm test`.
- ESLint/Tailwind configured; run `npm run lint` as needed.

## Backend Contract (per PRD)
- `POST /analyze` returns:
  - `story_id`, `summary.total_questions`, `summary.ai_provider_recognized_in`.
  - `metadata.client_name | provider_name | models_run | mode` (snake_case).
  - `selling_points` array (each entry uses `pillar` + optional `summary`, `questions`).
  - Question objects expose `id`, `prompt`, `category`, `kind`, optional `assumptions`, `responses`.
  - Response objects use `model`, `answer`, `ai_provider_inferred` (no `inferred`).
  - API may append extra fields (e.g., `scores`, `generated_at`). FE must ignore unrecognized properties.
- Requests accept `text`, optional `provider_name`, `provider_aliases`.

## Frontend Assumptions & Normalization
- `normalizeApiResponsePayload` accepts snake_case, camelCase, or wrapped (`{ data: ... }`) payloads.
- Pillar title rendering **must** use `pillar` value (`pillar.pillar ?? "Untitled pillar"`). Previous `title` support was removed per backend PRD.
- Responses default inference boolean from `ai_provider_inferred` when `inferred` missing.
- Dev builds log raw payload + Zod error details (`console.log` / `console.error`) for debugging; leave in place until instructed otherwise.

## Troubleshooting Steps
1. If you see `Received unexpected response format from API`, check console for the raw payload + Zod errors.
2. Update `responseSchema` in `src/lib/api.ts` cautiously. Mirror backend PRD: do not rename fields in outgoing UI state, only adapt internally.
3. Maintain adaptor tests (`src/__tests__/api.test.ts`). Add new table rows mirroring backend payload changes.

## Testing
- `npm test` — unit & component suite (fast).
- `npm run lint` — not run automatically; use before committing if possible.

## Misc
- Dev-only sample button controlled by `NEXT_PUBLIC_SHOW_SAMPLE_BUTTON`.
- Default provider config sourced from env (`NEXT_PUBLIC_DEFAULT_PROVIDER_*`).
- Keep `console.log("/analyze response", …)` until user removes requirement.

When adding features, extend `UIResult` and associated components (`ResultsSection`, `PillarCards`, etc.) accordingly and update adapter tests. Coordinate with backend before assuming new fields.
