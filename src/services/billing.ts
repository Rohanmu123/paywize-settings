import { GST_DETAILS, INVOICES, type Invoice } from "@/data/billing";
import { createStore } from "@/lib/store";
import { isEmail, isMobile } from "@/lib/validation";
import { delay } from "./delay";

export const invoicesStore = createStore<Invoice[]>(INVOICES);
export const gstStore = createStore(GST_DETAILS);

export const invoiceTotal = (i: Pick<Invoice, "fees" | "gst">) => Math.round((i.fees + i.gst) * 100) / 100;

export async function updateBillingEmail(email: string) {
  if (!isEmail(email)) throw new Error("Enter a valid email");
  await delay();
  gstStore.set((g) => ({ ...g, billingEmail: email.trim() }));
}

export async function requestAccountManagerCall(input: { mobile: string; need: string }) {
  if (!isMobile(input.mobile)) throw new Error("Enter a valid 10-digit mobile number");
  await delay();
  return { ticket: `AM-${Date.now().toString().slice(-6)}` };
}

export async function emailInvoice(number: string) {
  await delay();
  return { number, to: gstStore.get().billingEmail };
}

/** Mock download: builds a small text file so the browser has something real to save. */
export function downloadInvoice(inv: Invoice) {
  if (typeof window === "undefined") return;
  const body = [`Tax invoice ${inv.number}`, `Period: ${inv.period}`, `Issued: ${inv.issuedOn}`, `Taxable value: ${inv.fees}`, `IGST @ 18%: ${inv.gst}`, `Total: ${invoiceTotal(inv)}`].join("\n");
  const url = URL.createObjectURL(new Blob([body], { type: "text/plain" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${inv.number.replace(/\//g, "-")}.txt`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
