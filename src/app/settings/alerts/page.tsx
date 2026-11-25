import { Suspense } from "react";
import { AlertsView } from "@/features/alerts/AlertsView";

export const metadata = { title: "Alerts & recipients · Settings" };

export default function Page() {
  return (
    <Suspense>
      <AlertsView />
    </Suspense>
  );
}
