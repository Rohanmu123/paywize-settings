"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export function validateUpload(file: File, accept = ACCEPTED_TYPES, maxBytes = MAX_UPLOAD_BYTES): string | null {
  if (!accept.includes(file.type)) return "Only PDF or JPG files are allowed";
  if (file.size > maxBytes) return "File is larger than 5 MB";
  return null;
}

/** Dashed upload area ("Upload supporting document · PDF or JPG, up to 5 MB"). */
export function FileDrop({ title = "Upload supporting document", hint = "PDF or JPG, up to 5 MB", file, onFile, error, className, gap = 6, surface = "container", accept = ".pdf,.jpg,.jpeg,.png", validate = (f: File) => validateUpload(f) }: { title?: string; hint?: string; file?: File | null; onFile: (f: File | null, error: string | null) => void; error?: string | null; className?: string; gap?: 6 | 8; surface?: "container" | "background"; accept?: string; validate?: (f: File) => string | null }) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const take = (f: File | undefined) => {
    if (!f) return;
    onFile(f, validate(f));
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    take(e.dataTransfer.files[0]);
  };

  return (
    <div className="flex w-full flex-col gap-1.5">
      <label
        htmlFor={id}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className={cn(
          "flex w-full cursor-pointer flex-col items-center justify-center overflow-clip border border-dashed",
          surface === "container" ? "rounded-2xl bg-container p-5" : "rounded-3xl bg-background p-4",
          gap === 8 ? "gap-2" : "gap-1.5",
          over ? "border-primary" : error ? "border-error" : "border-border",
          className,
        )}
      >
        <Icon icon={Upload} size={20} className="text-text-primary" />
        <span className="type-14m text-text-primary">{file ? file.name : title}</span>
        <span className="type-12r text-text-secondary">{file ? `${(file.size / 1024).toFixed(0)} KB · click to replace` : hint}</span>
      </label>
      <input ref={input} id={id} type="file" accept={accept} className="sr-only" data-testid="file-input" onChange={(e) => take(e.target.files?.[0])} />
      {error && <p className="type-12r text-error">{error}</p>}
    </div>
  );
}
