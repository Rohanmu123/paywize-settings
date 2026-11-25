import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

/** Sticky-free "Save bar" card at the bottom of full-page editors. */
export function SaveBar({ message, onDiscard, onSave, saveDisabled, saveLabel = "Save changes", discardLabel = "Discard" }: { message: ReactNode; onDiscard: () => void; onSave: () => void; saveDisabled?: boolean; saveLabel?: string; discardLabel?: string }) {
  return (
    <div className="flex w-full items-center justify-between overflow-clip rounded-3xl bg-surface px-5 py-4" data-testid="save-bar">
      <p className="type-14r text-text-secondary whitespace-nowrap" aria-live="polite">
        {message}
      </p>
      <div className="flex items-start gap-3">
        <Button variant="outline" onClick={onDiscard}>
          {discardLabel}
        </Button>
        <Button onClick={onSave} disabled={saveDisabled}>
          {saveLabel}
        </Button>
      </div>
    </div>
  );
}
