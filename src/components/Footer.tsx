export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 text-xs text-slate-500">
        <span>© {new Date().getFullYear()} Brand Visibility</span>
        <span>Health check at /health</span>
      </div>
    </footer>
  );
}
