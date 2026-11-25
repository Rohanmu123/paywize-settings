import { Suspense } from "react";
import { LoginHistoryView } from "@/features/sessions/LoginHistoryView";

export const metadata = { title: "Login & history · Settings" };

export default function Page() {
  return (
    <Suspense>
      <LoginHistoryView />
    </Suspense>
  );
}
