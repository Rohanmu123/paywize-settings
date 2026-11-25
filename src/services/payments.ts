import { initialPayments, type LimitRow, type PaymentsState } from "@/data/payments";
import { createStore } from "@/lib/store";
import { delay } from "./delay";

export const paymentsStore = createStore<PaymentsState>(initialPayments);

const setLimit = (id: LimitRow["id"], patch: Partial<LimitRow>) =>
  paymentsStore.set((s) => ({ ...s, limits: s.limits.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
const setMethod = (id: string, state: PaymentsState["methods"][number]["state"]) =>
  paymentsStore.set((s) => ({ ...s, methods: s.methods.map((m) => (m.id === id ? { ...m, state } : m)) }));

export const activeMethodCount = (s: PaymentsState) => s.methods.filter((m) => m.state === "on").length;

export async function toggleMethod(id: string, on: boolean) {
  if (!on && activeMethodCount(paymentsStore.get()) <= 1) throw new Error("Keep at least one payment method on");
  await delay();
  setMethod(id, on ? "on" : "off");
}

export async function requestMethodAccess(id: string, useCase: string) {
  if (useCase.trim().length < 10) throw new Error("Tell us a little more (at least 10 characters)");
  await delay();
  setMethod(id, "requested");
}

/** "₹ 60,00,000" / "6000000" → 6000000 */
export function parseRupees(v: string): number {
  const n = Number(v.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}
export const formatRupeeInput = (v: string) => {
  const n = parseRupees(v);
  return n ? `₹ ${Math.floor(n).toLocaleString("en-IN")}` : "";
};

export function validateLimitRequest(input: { amount: number; reason: string; current: number }) {
  const e: { amount?: string; reason?: string } = {};
  if (!input.amount) e.amount = "Enter the limit you need";
  else if (input.amount <= input.current) e.amount = "Must be higher than your current limit";
  if (input.reason.trim().length < 5) e.reason = "Add a short reason";
  return e;
}

export async function requestLimitIncrease(id: LimitRow["id"], amount: number) {
  await delay();
  setLimit(id, { requested: amount, status: "review" });
}

export async function cancelLimitRequest(id: LimitRow["id"]) {
  await delay();
  setLimit(id, { requested: null, status: "active" });
}

export async function startInternationalCards() {
  await delay();
  setLimit("intl", { status: "review" });
}

export async function setPassFee(passFee: boolean) {
  await delay();
  paymentsStore.set((s) => ({ ...s, passFee }));
}
