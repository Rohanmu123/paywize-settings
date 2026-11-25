import { Suspense } from "react";
import { DomainsView } from "@/features/domains/DomainsView";

export const metadata = { title: "Domains & URLs · Settings" };

export default function Page() {
  return (
    <Suspense>
      <DomainsView />
    </Suspense>
  );
}
