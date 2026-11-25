/** Simulated network latency for the mock services (0 in tests). */
export const LATENCY_MS = process.env.NODE_ENV === "test" ? 0 : 150;

export function delay<T = void>(ms = LATENCY_MS, value?: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value as T), ms));
}
