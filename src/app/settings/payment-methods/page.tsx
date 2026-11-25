import { Suspense } from "react";
import { PaymentMethodsView } from "@/features/payments/PaymentMethodsView";

export const metadata = { title: "Payment methods & limits · Settings" };

export default function Page() {
  return (
    <Suspense>
      <PaymentMethodsView />
    </Suspense>
  );
}
