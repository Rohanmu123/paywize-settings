import { Suspense } from "react";
import { BusinessProfileView } from "@/features/business-profile/BusinessProfileView";

export const metadata = { title: "Business profile · Settings" };

export default function Page() {
  return (
    <Suspense>
      <BusinessProfileView />
    </Suspense>
  );
}
