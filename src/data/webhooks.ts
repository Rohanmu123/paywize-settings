export type EndpointStatus = "active" | "paused";

export const EVENT_GROUPS = {
  "payments-refunds": {
    label: "All payment and refund events",
    events: ["payment.captured", "payment.failed", "refund.created", "settlement.processed", "payment.authorized", "payment.pending", "payment.dispute.created", "payment.dispute.won", "payment.dispute.lost", "refund.processed", "refund.failed", "order.paid", "order.expired", "invoice.paid"],
  },
  payments: { label: "Payment events only", events: ["payment.captured", "payment.failed", "payment.authorized", "payment.pending", "order.paid", "order.expired"] },
  refunds: { label: "Refund events only", events: ["refund.created", "refund.processed"] },
  settlements: { label: "Settlement events only", events: ["settlement.processed", "settlement.failed"] },
} as const;

export type EventGroup = keyof typeof EVENT_GROUPS;

export type Endpoint = {
  id: string;
  url: string;
  group: EventGroup;
  successRate: string;
  status: EndpointStatus;
  addedOn: string;
  addedBy: string;
  lastDelivery: string;
  /** For paused endpoints: failed events waiting to be retried. */
  pendingEvents?: number;
  failure?: { code: number; attempts: number; pausedAt: string };
};

export type Delivery = {
  id: string;
  event: string;
  endpointId: string;
  response: { label: string; tone: "success" | "error" | "warning" };
  at: string;
  attempt: string;
  ms: number;
  request: string;
  reply: string;
};

export const ENDPOINTS: Endpoint[] = [
  { id: "ep1", url: "https://api.sharmatextiles.in/webhooks/paywize", group: "payments-refunds", successRate: "99.8%", status: "active", addedOn: "3 Mar 2026", addedBy: "Meera I.", lastDelivery: "23 Nov, 11:20 AM" },
  { id: "ep2", url: "https://erp.sharmatextiles.in/hooks/pw", group: "payments", successRate: "0%", status: "paused", addedOn: "18 Jun 2026", addedBy: "Rohan S.", lastDelivery: "22 Nov, 04:12 PM", pendingEvents: 18, failure: { code: 503, attempts: 18, pausedAt: "22 Nov, 4:12 PM" } },
  { id: "ep3", url: "https://hooks.zapier.com/hooks/catch/48213/ab12", group: "refunds", successRate: "100%", status: "active", addedOn: "9 Sep 2026", addedBy: "Karan M.", lastDelivery: "21 Nov, 02:30 PM" },
];

const req = (path: string, event: string, id: string, amount: number) =>
  `POST ${path}\nX-Paywize-Signature: t=1732360200,v1=9f2c41ab…\n{ "event": "${event}", "id": "${id}", "amount": ${amount} }`;

export const DELIVERIES: Delivery[] = [
  { id: "d1", event: "payment.captured", endpointId: "ep1", response: { label: "200 OK", tone: "success" }, at: "23 Nov, 11:20 AM", attempt: "attempt 1 of 5", ms: 142, request: req("/webhooks/paywize", "payment.captured", "pay_Q8x2nL5", 698114), reply: '200 OK\n{ "received": true }' },
  { id: "d2", event: "settlement.processed", endpointId: "ep1", response: { label: "200 OK", tone: "success" }, at: "23 Nov, 10:05 AM", attempt: "attempt 1 of 5", ms: 188, request: req("/webhooks/paywize", "settlement.processed", "setl_7Kd21Q", 18420000), reply: '200 OK\n{ "received": true }' },
  { id: "d3", event: "payment.failed", endpointId: "ep2", response: { label: "503 Error", tone: "error" }, at: "22 Nov, 04:12 PM", attempt: "attempt 5 of 5", ms: 2310, request: req("/hooks/pw", "payment.failed", "pay_L2m9xT1", 125000), reply: "503 Service Unavailable\nupstream connect error" },
  { id: "d4", event: "refund.created", endpointId: "ep2", response: { label: "Timeout", tone: "warning" }, at: "22 Nov, 04:09 PM", attempt: "attempt 5 of 5", ms: 10000, request: req("/hooks/pw", "refund.created", "rfnd_9Pq3Za", 45000), reply: "No reply within 10 seconds" },
];
