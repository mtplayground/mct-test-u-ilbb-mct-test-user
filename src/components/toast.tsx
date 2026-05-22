import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

export type ToastMessage = {
  tone: "success" | "error";
  message: string;
};

type ToastProps = {
  toast: ToastMessage;
  onDismiss: () => void;
};

export function Toast({ toast, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-sm items-start gap-3 rounded-lg border border-border bg-card p-3 text-sm text-card-foreground shadow-lg">
      <div className="min-w-0 flex-1">
        <p className={toast.tone === "error" ? "font-medium text-destructive" : "font-medium"}>
          {toast.message}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={onDismiss}
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
