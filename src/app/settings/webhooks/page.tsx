import { Suspense } from "react";
import { WebhooksView } from "@/features/webhooks/WebhooksView";

export const metadata = { title: "Webhooks · Settings" };

export default function Page() {
  return (
    <Suspense>
      <WebhooksView />
    </Suspense>
  );
}
