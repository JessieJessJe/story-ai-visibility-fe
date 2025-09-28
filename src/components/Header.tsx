import { Info } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-5">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Brand Visibility</h1>
          <p className="mt-1 text-sm text-slate-600">
            Understand how AI providers appear in your narratives.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
          <Info className="h-4 w-4" aria-hidden />
          Mask providers before running analysis to reduce bias.
        </div>
      </div>
    </header>
  );
}
