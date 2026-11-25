import { initialBranding, type Branding } from "@/data/branding";
import { createStore } from "@/lib/store";
import { delay } from "./delay";

export const brandingStore = createStore<Branding>(initialBranding);

export async function saveBranding(next: Branding) {
  await delay();
  brandingStore.set(next);
}

export function brandingChanged(a: Branding, b: Branding) {
  return JSON.stringify(a) !== JSON.stringify(b);
}

/** Moves `id` one step up/down (or to `toIndex`) inside the order list. */
export function moveMethod<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length || from === to) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item!);
  return next;
}

export function validateLogo(file: File): string | null {
  if (!["image/png", "image/jpeg", "image/svg+xml"].includes(file.type)) return "Use a PNG, JPG or SVG file";
  if (file.size > 1024 * 1024) return "Logo must be 1 MB or smaller";
  return null;
}
