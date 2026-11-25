/** Formats free typing into "DD / MM / YYYY". */
export function formatDateInput(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  const parts = [d.slice(0, 2), d.slice(2, 4), d.slice(4, 8)].filter(Boolean);
  return parts.join(" / ");
}

/** Validates a "DD / MM / YYYY" string as a real calendar date. */
export function parseDateInput(v: string): Date | null {
  const m = v.match(/^(\d{2}) \/ (\d{2}) \/ (\d{4})$/);
  if (!m) return null;
  const [dd, mm, yyyy] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(yyyy, mm - 1, dd);
  if (date.getFullYear() !== yyyy || date.getMonth() !== mm - 1 || date.getDate() !== dd) return null;
  return date;
}
