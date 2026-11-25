import { Calculator, Clock, IdCard, Landmark, Send, Wallet, type LucideIcon } from "lucide-react";

export const BRAND_SWATCHES = ["#ec4899", "#f43f5e", "#d946ef", "#8b5cf6", "#0ea5e9", "#10b981", "#84cc16"] as const;

export type MethodId = "upi" | "cards" | "netbanking" | "wallets" | "emi" | "paylater";

/** Checkbox grid order (3 per row) and checkout labels/icons. */
export const PAYMENT_METHODS: { id: MethodId; label: string; checkout: string; icon: LucideIcon }[] = [
  { id: "upi", label: "UPI", checkout: "Pay by any UPI app", icon: Send },
  { id: "cards", label: "Cards", checkout: "Debit / Credit card", icon: IdCard },
  { id: "netbanking", label: "Net banking", checkout: "Net banking", icon: Landmark },
  { id: "wallets", label: "Wallets", checkout: "Wallets", icon: Wallet },
  { id: "emi", label: "EMI", checkout: "EMI", icon: Calculator },
  { id: "paylater", label: "Pay later", checkout: "Pay later", icon: Clock },
];

export type FailureAction = "return" | "retry";

export type Branding = {
  logo: string | null;
  brandName: string;
  headerColor: string;
  buttonColor: string;
  enabled: MethodId[];
  order: MethodId[];
  onFailure: FailureAction;
};

export const BRAND_NAME_MAX = 30;

export const initialBranding: Branding = {
  logo: null,
  brandName: "Sharma Textiles",
  headerColor: "#8b5cf6",
  buttonColor: "#8b5cf6",
  enabled: ["upi", "cards", "netbanking", "emi", "paylater"],
  order: ["upi", "cards", "netbanking", "paylater", "emi", "wallets"],
  onFailure: "return",
};

export const PREVIEW_ORDER = { amount: 2499, id: "PW-4821" };
