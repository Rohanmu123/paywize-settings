export type PricingRow = { service: string; upi: string; cards: string; netbanking: string; settlement: string };

export const PRICING: PricingRow[] = [
  { service: "Payment Gateway", upi: "0%", cards: "1.8% + GST", netbanking: "1.9% + GST", settlement: "T+1" },
  { service: "Payment Links", upi: "0%", cards: "1.8% + GST", netbanking: "1.9% + GST", settlement: "T+1" },
  { service: "Payouts", upi: "₹3 / IMPS", cards: "—", netbanking: "—", settlement: "Instant" },
];

export const GST_DETAILS = { gstin: "27ABCPS1234F1Z5", billingEmail: "accounts@sharmatextiles.in" };

export type InvoiceStatus = "due" | "paid";
export type LineItem = { description: string; sac: string; amount: number };
export type InvoicePayment = { date: string; method: string; reference: string; amount: number };

export type Invoice = {
  number: string;
  period: string;
  issuedOn: string;
  dueBy: string;
  fees: number;
  gst: number;
  status: InvoiceStatus;
  irn: string;
  ackNo: string;
  lineItems: LineItem[];
  payments: InvoicePayment[];
};

export const SUPPLIER = { gstin: "27AAACS1234F1Z5", name: "Paywize Technologies" };
export const BILLED_TO = { gstin: "29AABCU9603R1ZX", name: "Your business" };

export const INVOICES: Invoice[] = [
  {
    number: "PW/2610/0481",
    period: "October 2026",
    issuedOn: "1 Nov 2026",
    dueBy: "10 Nov 2026",
    fees: 95261.19,
    gst: 17147.01,
    status: "due",
    irn: "e3b0c442…7852b855",
    ackNo: "112610048123",
    lineItems: [
      { description: "Payment processing fees", sac: "997159", amount: 78420 },
      { description: "Settlement charges", sac: "997159", amount: 5842.19 },
      { description: "Platform fee", sac: "997159", amount: 10999 },
    ],
    payments: [],
  },
  {
    number: "PW/2609/0377",
    period: "September 2026",
    issuedOn: "1 Oct 2026",
    dueBy: "10 Oct 2026",
    fees: 86402.11,
    gst: 15552.38,
    status: "paid",
    irn: "9f86d081…b0f00a08",
    ackNo: "112609037712",
    lineItems: [
      { description: "Payment processing fees", sac: "997159", amount: 70812.4 },
      { description: "Settlement charges", sac: "997159", amount: 4590.71 },
      { description: "Platform fee", sac: "997159", amount: 10999 },
    ],
    payments: [{ date: "5 Oct 2026", method: "Adjusted from settlement", reference: "STL-2610-0091", amount: 101954.49 }],
  },
  {
    number: "PW/2608/0212",
    period: "August 2026",
    issuedOn: "1 Sep 2026",
    dueBy: "10 Sep 2026",
    fees: 41870,
    gst: 7536.6,
    status: "paid",
    irn: "2c26b46b…ae7d2b8f",
    ackNo: "112608021290",
    lineItems: [
      { description: "Payment processing fees", sac: "997159", amount: 27645 },
      { description: "Settlement charges", sac: "997159", amount: 3226 },
      { description: "Platform fee", sac: "997159", amount: 10999 },
    ],
    payments: [{ date: "8 Sep 2026", method: "NEFT", reference: "UTR HDFC0882134", amount: 49406.6 }],
  },
];
export const INVOICE_STATUS = { due: { label: "Due", tone: "warning" }, paid: { label: "Paid", tone: "success" } } as const;
