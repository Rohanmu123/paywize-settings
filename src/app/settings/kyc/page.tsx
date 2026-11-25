import { Suspense } from "react";
import { KycView } from "@/features/kyc/KycView";

export const metadata = { title: "KYC & compliance · Settings" };

export default function Page() {
  return (
    <Suspense>
      <KycView />
    </Suspense>
  );
}
