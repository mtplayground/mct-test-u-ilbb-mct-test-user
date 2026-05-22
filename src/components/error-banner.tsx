import { AlertTriangle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PreviewErrorPayload } from "@/lib/document-builder";

type ErrorBannerProps = {
  error: PreviewErrorPayload;
  onDismiss: () => void;
};

export function ErrorBanner({ error, onDismiss }: ErrorBannerProps) {
  const location = formatErrorLocation(error);

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-medium">Preview error</p>
        <p className="mt-1 break-words text-destructive/90">{error.message}</p>
        {location ? <p className="mt-1 text-xs text-destructive/70">{location}</p> : null}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={onDismiss}
        aria-label="Dismiss preview error"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

function formatErrorLocation(error: PreviewErrorPayload) {
  if (!error.filename && !error.lineno) {
    return "";
  }

  const line = error.lineno ? `:${error.lineno}` : "";
  const column = error.colno ? `:${error.colno}` : "";

  return `${error.filename || "preview"}${line}${column}`;
}
