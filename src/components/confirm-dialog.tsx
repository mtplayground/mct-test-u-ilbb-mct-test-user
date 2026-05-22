import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-md rounded-lg border border-border bg-card text-card-foreground shadow-lg"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border p-4">
          <div>
            <h2 id="confirm-dialog-title" className="text-lg font-semibold tracking-normal">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onCancel} aria-label="Cancel">
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </header>

        <footer className="flex justify-end gap-2 p-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="default" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </footer>
      </section>
    </div>
  );
}
