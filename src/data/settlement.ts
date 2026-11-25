export type AccountStatus = "primary" | "review" | "mismatch" | "verifying" | "cancelled";

export type BankAccount = {
  id: string;
  bank: string;
  type: "Current" | "Savings";
  last4: string;
  accountNumber: string;
  holder: string;
  holderOnBank?: string;
  ifsc: string;
  branch: string;
  added: string;
  status: AccountStatus;
  verifiedBy?: string;
  lastSettlement?: string;
  cheque?: { file: string; uploaded: string };
};

export const ACCOUNT_STATUS: Record<AccountStatus, { label: string; tone: "success" | "warning" | "error" | "neutral" | "info" }> = {
  primary: { label: "Primary · Verified", tone: "success" },
  review: { label: "Under review", tone: "warning" },
  verifying: { label: "Verifying", tone: "info" },
  mismatch: { label: "Name mismatch", tone: "error" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

export type ChangeRequest = { id: string; accountId: string; submitted: string; submittedOn: string; by: string; step: 1 | 2 | 3 | 4 };
export const CHANGE_STEPS = ["Submitted", "Owner approved with code", "Bank verification", "Activated"] as const;

export type ScheduleId = "t1" | "t2" | "t0" | "weekly";
export const SCHEDULES: Record<ScheduleId, { page: string; title: string; hint: string }> = {
  t1: { page: "T+1 working day", title: "Next working day (T+1)", hint: "Standard. Payments up to midnight." },
  t2: { page: "T+2 working days", title: "Two working days (T+2)", hint: "Gives you an extra day to handle refunds." },
  t0: { page: "Same day (T+0)", title: "Same day (T+0)", hint: "Needs 6 months of clean history" },
  weekly: { page: "Weekly, every Monday", title: "Weekly", hint: "Every Monday" },
};
/** The page lists T+1/T+2/Weekly; the edit pop-up lists T+1/T+0/Weekly (as designed). */
export const PAGE_SCHEDULES: ScheduleId[] = ["t1", "t2", "weekly"];
export const MODAL_SCHEDULES: ScheduleId[] = ["t1", "t0", "weekly"];

export type SettlementState = {
  accounts: BankAccount[];
  request: ChangeRequest | null;
  schedule: ScheduleId;
  instant: boolean;
  paused: boolean;
};

export const initialSettlement: SettlementState = {
  accounts: [
    { id: "hdfc", bank: "HDFC Bank", type: "Current", last4: "9489", accountNumber: "50200012349489", holder: "Sharma Textiles Private Limited", ifsc: "HDFC0000123", branch: "Thane", added: "14 Aug 2026", status: "primary", verifiedBy: "Penny-drop ₹1", lastSettlement: "22 Nov · ₹4,82,300", cheque: { file: "cheque_hdfc.jpg", uploaded: "14 Aug 2026" } },
    { id: "icici", bank: "ICICI Bank", type: "Current", last4: "4421", accountNumber: "000405004421", holder: "Sharma Textiles Private Limited", ifsc: "ICIC0001234", branch: "Fort, Mumbai", added: "22 Nov 2026", status: "review" },
    { id: "axis", bank: "Axis Bank", type: "Current", last4: "7710", accountNumber: "00330100017710", holder: "Sharma Textiles Private Limited", holderOnBank: "R SHARMA", ifsc: "UTIB0000033", branch: "Andheri, Mumbai", added: "18 Nov 2026", status: "mismatch" },
  ],
  request: { id: "CR-20418", accountId: "icici", submitted: "22 Nov, 3:40 PM", submittedOn: "22 Nov 2026", by: "Rohan Sharma", step: 3 },
  schedule: "t1",
  instant: true,
  paused: false,
};

export const SERVICES_SCOPE = ["Payment Gateway", "Payment Links", "Payouts"] as const;
