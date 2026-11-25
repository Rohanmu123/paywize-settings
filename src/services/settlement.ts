import { initialSettlement, type BankAccount, type ScheduleId, type SettlementState } from "@/data/settlement";
import { createStore } from "@/lib/store";
import { isAccountNumber, isIfsc } from "@/lib/validation";
import { delay } from "./delay";

export const settlementStore = createStore<SettlementState>(initialSettlement);

const patchAccount = (id: string, patch: Partial<BankAccount>) =>
  settlementStore.set((s) => ({ ...s, accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)) }));

export const primaryAccount = (s: SettlementState) => s.accounts.find((a) => a.status === "primary")!;
export const maskAccount = (a: Pick<BankAccount, "bank" | "last4">) => `${a.bank} ••${a.last4}`;

export type NewAccountInput = { holder: string; accountNumber: string; ifsc: string };

export function validateBankAccount(input: NewAccountInput, requireHolder = true): Partial<Record<keyof NewAccountInput, string>> {
  const e: Partial<Record<keyof NewAccountInput, string>> = {};
  if (requireHolder && input.holder.trim().length < 3) e.holder = "Enter the name exactly as on bank records";
  if (!isAccountNumber(input.accountNumber)) e.accountNumber = "Account number must be 9 to 18 digits";
  if (!isIfsc(input.ifsc)) e.ifsc = "Enter a valid 11-character IFSC, like ICIC0001234";
  return e;
}

const BANKS: Record<string, string> = { HDFC: "HDFC Bank", ICIC: "ICICI Bank", UTIB: "Axis Bank", SBIN: "State Bank of India", KKBK: "Kotak Mahindra Bank", YESB: "Yes Bank" };
export const bankFromIfsc = (ifsc: string) => BANKS[ifsc.slice(0, 4).toUpperCase()] ?? "Bank";

export async function addBankAccount(input: NewAccountInput) {
  await delay();
  const digits = input.accountNumber.replace(/\s/g, "");
  const account: BankAccount = {
    id: `acc-${Date.now()}`,
    bank: bankFromIfsc(input.ifsc),
    type: "Current",
    last4: digits.slice(-4),
    accountNumber: digits,
    holder: input.holder.trim(),
    ifsc: input.ifsc.trim().toUpperCase(),
    branch: "—",
    added: "Today",
    status: "verifying",
  };
  settlementStore.set((s) => ({ ...s, accounts: [...s.accounts, account] }));
  return account;
}

export async function retryVerification(id: string, input: Pick<NewAccountInput, "accountNumber" | "ifsc">) {
  await delay();
  const digits = input.accountNumber.replace(/\s/g, "");
  patchAccount(id, { accountNumber: digits, last4: digits.slice(-4), ifsc: input.ifsc.trim().toUpperCase(), status: "verifying", holderOnBank: undefined });
}

export async function cancelChangeRequest() {
  await delay();
  settlementStore.set((s) => ({
    ...s,
    request: null,
    accounts: s.accounts.map((a) => (s.request && a.id === s.request.accountId ? { ...a, status: "cancelled" } : a)),
  }));
}

export async function updateSchedule(schedule: ScheduleId) {
  await delay();
  settlementStore.set((s) => ({ ...s, schedule }));
}

export async function setInstantSettlement(instant: boolean) {
  await delay();
  settlementStore.set((s) => ({ ...s, instant }));
}

export async function setSettlementsPaused(paused: boolean) {
  await delay();
  settlementStore.set((s) => ({ ...s, paused }));
}
