import { Suspense } from "react";
import { PayoutsView } from "@/features/payouts/PayoutsView";

export const metadata = { title: "Payouts · Settings" };

export default function Page() {
  return (
    <Suspense>
      <PayoutsView />
    </Suspense>
  );
}
