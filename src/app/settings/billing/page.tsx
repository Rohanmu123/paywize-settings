import { Suspense } from "react";
import { BillingView } from "@/features/billing/BillingView";

export const metadata = { title: "Billing & invoices · Settings" };

export default function Page() {
  return (
    <Suspense>
      <BillingView />
    </Suspense>
  );
}
