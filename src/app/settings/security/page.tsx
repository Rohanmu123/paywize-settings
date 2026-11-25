import { Suspense } from "react";
import { SecurityView } from "@/features/security/SecurityView";

export const metadata = { title: "Security · Settings" };

export default function Page() {
  return (
    <Suspense>
      <SecurityView />
    </Suspense>
  );
}
