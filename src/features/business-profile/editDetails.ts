export type EditDetailsForm = {
  displayName: string;
  website: string;
  supportEmail: string;
  supportPhone: string;
  category: string;
  line1: string;
  city: string;
  state: string;
  pin: string;
};

export function validateEditDetails(f: EditDetailsForm): Partial<Record<keyof EditDetailsForm, string>> {
  const e: Partial<Record<keyof EditDetailsForm, string>> = {};
  if (!f.displayName.trim()) e.displayName = "Display name is required";
  if (f.website && !/^https?:\/\/[^\s.]+\.[^\s]+$/.test(f.website.trim())) e.website = "Enter a full URL starting with https://";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.supportEmail.trim())) e.supportEmail = "Enter a valid email";
  if (f.supportPhone.replace(/\D/g, "").length < 10) e.supportPhone = "Enter a valid phone number";
  if (!f.line1.trim()) e.line1 = "Address is required";
  if (!f.city.trim()) e.city = "City is required";
  if (!/^\d{6}$/.test(f.pin.trim())) e.pin = "PIN code must be 6 digits";
  return e;
}

export function countChanges<T extends Record<string, string>>(initial: T, current: T): number {
  return (Object.keys(initial) as (keyof T)[]).filter((k) => initial[k] !== current[k]).length;
}

/** Save-bar copy: "3 changes · PIN code needs fixing before you can save". */
export function saveBarMessage(changes: number, errors: Partial<Record<string, string>>, labels: Record<string, string>): string {
  const firstError = Object.keys(errors).find((k) => errors[k]);
  const head = changes === 0 ? "No changes" : `${changes} change${changes === 1 ? "" : "s"}`;
  if (firstError) return `${head} · ${labels[firstError] ?? firstError} needs fixing before you can save`;
  return head;
}
