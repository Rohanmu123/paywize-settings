import { Suspense } from "react";
import { SettlementView } from "@/features/settlement/SettlementView";

export const metadata = { title: "Settlement account · Settings" };

export default function Page() {
  return (
    <Suspense>
      <SettlementView />
    </Suspense>
  );
}
