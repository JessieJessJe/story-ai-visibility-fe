# Brand Visibility UI

Next.js + TypeScript frontend for analyzing narrative transcripts and visualizing AI provider visibility.

## Getting started

1. Install dependencies
   ```bash
   npm install
   ```
2. Copy environment template and configure API
   ```bash
   cp .env.local.example .env.local
   ```
3. Run the development server
   ```bash
   npm run dev
   ```

## Available scripts

- `npm run dev` – start Next.js in development mode.
- `npm run build` – build production bundle.
- `npm run start` – launch production server.
- `npm run lint` – run ESLint using Next.js defaults.
- `npm run test` – execute unit and component tests with Jest.

## Testing

- Response adapter unit tests live in `src/__tests__/api.test.ts`.
- Results UI is covered by `src/components/results/__tests__/ResultsSection.test.tsx`.

## Folder structure

- `src/app` – Next.js App Router pages.
- `src/components` – UI building blocks and visualization components.
- `src/hooks` – shared React hooks.
- `src/lib` – API utilities and adapters.
- `src/types` – shared TypeScript contracts.
- `src/__tests__` – unit tests.
