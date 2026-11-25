export type KycStatus = "verified" | "expiring" | "rejected" | "pending";
export type KycDocument = {
  id: string;
  name: string;
  type: string;
  status: KycStatus;
  note: string;
  file?: { name: string; format: "PDF" | "JPG" | "PNG"; sizeMb: number; uploadedOn: string };
  expiresOn?: string;
};

export const KYC_DOCUMENT_TYPES = [
  "Company PAN",
  "GST certificate",
  "Certificate of incorporation",
  "Director KYC",
  "Address proof",
  "Cancelled cheque",
  "Turnover declaration",
];

export const processingLimit = { used: 2840000, limit: 4000000 };

export const kycDocuments: KycDocument[] = [
  { id: "pan", name: "Company PAN", type: "PAN card", status: "verified", note: "Matched with NSDL", file: { name: "PAN_card.pdf", format: "PDF", sizeMb: 1.2, uploadedOn: "12 Mar 2026" } },
  { id: "gst", name: "GST certificate", type: "GST certificate", status: "verified", note: "Matched with GST portal", file: { name: "GST_certificate.pdf", format: "PDF", sizeMb: 0.8, uploadedOn: "12 Mar 2026" } },
  { id: "coi", name: "Certificate of incorporation", type: "Certificate of incorporation", status: "verified", note: "MCA record matched", file: { name: "COI.pdf", format: "PDF", sizeMb: 2.1, uploadedOn: "12 Mar 2026" } },
  { id: "director", name: "Director KYC · Rohan Sharma", type: "Director KYC", status: "verified", note: "Aadhaar + PAN matched", file: { name: "Director_KYC.pdf", format: "PDF", sizeMb: 1.6, uploadedOn: "14 Mar 2026" } },
  { id: "address", name: "Address proof", type: "Address proof", status: "expiring", note: "Utility bill dated 30 Nov 2025", expiresOn: "30 Nov 2026" },
  { id: "cheque", name: "Cancelled cheque", type: "Cancelled cheque", status: "rejected", note: "Blurred. Retake in good light" },
  { id: "turnover", name: "Turnover declaration", type: "Turnover declaration", status: "pending", note: "Raises limit above ₹40L" },
];
