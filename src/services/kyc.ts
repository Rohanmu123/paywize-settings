import { kycDocuments, type KycDocument } from "@/data/kyc";
import { createStore } from "@/lib/store";
import { delay } from "./delay";

export const kycStore = createStore<KycDocument[]>(kycDocuments);

export function attentionCount(docs: KycDocument[]) {
  return docs.filter((d) => d.status === "expiring" || d.status === "rejected").length;
}

export async function uploadKycDocument(input: { type: string; file: File; expiry?: string }) {
  await delay();
  const ext = (input.file.name.split(".").pop() ?? "pdf").toUpperCase();
  const format = (ext === "JPEG" ? "JPG" : ext) as "PDF" | "JPG" | "PNG";
  kycStore.set((docs) =>
    docs.map((d) =>
      d.type === input.type || d.name.startsWith(input.type)
        ? { ...d, status: "pending", note: "Under review · 1–2 working days", file: { name: input.file.name, format, sizeMb: +(input.file.size / 1048576).toFixed(1), uploadedOn: "Today" }, expiresOn: input.expiry }
        : d,
    ),
  );
}
