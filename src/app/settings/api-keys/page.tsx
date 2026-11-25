import { Suspense } from "react";
import { ApiKeysView } from "@/features/api-keys/ApiKeysView";

export const metadata = { title: "API keys · Settings" };

export default function Page() {
  return (
    <Suspense>
      <ApiKeysView />
    </Suspense>
  );
}
