export type MethodState = "on" | "off" | "not-enabled" | "requested" | "review" | "unavailable";

export type PaymentMethodRow = { id: string; name: string; detail: string; state: MethodState };

export const PAYMENT_METHOD_ROWS: PaymentMethodRow[] = [
  { id: "upi", name: "UPI", detail: "GPay, PhonePe, Paytm and any UPI app · 0% MDR", state: "on" },
  { id: "cards", name: "Cards", detail: "Visa, Mastercard, RuPay, Amex · 1.8% + GST", state: "on" },
  { id: "netbanking", name: "Netbanking", detail: "58 banks · 1.9% + GST", state: "on" },
  { id: "wallets", name: "Wallets", detail: "Paytm, PhonePe, Amazon Pay", state: "not-enabled" },
  { id: "emi", name: "EMI", detail: "Card and cardless EMI", state: "review" },
  { id: "paylater", name: "Pay Later", detail: "Not available for Apparel & accessories retail (MCC 5651)", state: "unavailable" },
];

export type LimitStatus = "active" | "review" | "needs-docs";
export type LimitRow = { id: "per-txn" | "daily" | "intl"; name: string; current: number | "Off" | "On"; requested: number | null; status: LimitStatus };

export const LIMIT_STATUS: Record<LimitStatus, { label: string; tone: "success" | "warning" | "neutral" }> = {
  active: { label: "Active", tone: "success" },
  review: { label: "Under review", tone: "warning" },
  "needs-docs": { label: "Needs documents", tone: "neutral" },
};

export const LIMIT_ROWS: LimitRow[] = [
  { id: "per-txn", name: "Per transaction", current: 500000, requested: null, status: "active" },
  { id: "daily", name: "Daily volume", current: 5000000, requested: 10000000, status: "review" },
  { id: "intl", name: "International cards", current: "Off", requested: null, status: "needs-docs" },
];

export type PaymentsState = { methods: PaymentMethodRow[]; limits: LimitRow[]; passFee: boolean };
export const initialPayments: PaymentsState = { methods: PAYMENT_METHOD_ROWS, limits: LIMIT_ROWS, passFee: false };
