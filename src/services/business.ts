import { businessProfile } from "@/data/business";
import type { BusinessProfile } from "@/data/types";
import { createStore } from "@/lib/store";
import { delay } from "./delay";

export const businessStore = createStore<BusinessProfile>(businessProfile);

export async function updateBusinessDetails(patch: Pick<BusinessProfile, "displayName" | "category"> & Partial<Pick<BusinessProfile, "operatingAddress">>) {
  await delay();
  businessStore.set((p) => ({ ...p, ...patch }));
}

export async function updateContact(contact: Partial<BusinessProfile["contact"]>) {
  await delay();
  businessStore.set((p) => ({ ...p, contact: { ...p.contact, ...contact } }));
}

export async function requestOwnershipTransfer(email: string) {
  await delay();
  return { requestId: `OT-${Date.now().toString(36).toUpperCase()}`, email };
}

export async function requestAccountClosure(reason: string) {
  await delay();
  businessStore.set((p) => ({ ...p, status: "active" }));
  return { requestId: `CL-${Date.now().toString(36).toUpperCase()}`, reason };
}

export async function raiseChangeRequest(field: string, value: string, note: string) {
  await delay();
  return { requestId: `CR-${Date.now().toString(36).toUpperCase()}`, field, value, note };
}
