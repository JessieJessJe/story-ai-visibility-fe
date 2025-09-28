import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-danger/40 bg-danger/10 p-4 text-danger">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5" aria-hidden />
        <div className="space-y-3">
          <div>
            <h3 className="text-base font-semibold">Analysis failed</h3>
            <p className="text-sm text-danger/80">{message}</p>
          </div>
          <Button type="button" variant="danger" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" aria-hidden />
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
}
