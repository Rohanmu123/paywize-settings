import { Suspense } from "react";
import { EditBusinessDetailsView } from "@/features/business-profile/EditBusinessDetailsView";

export const metadata = { title: "Edit business details · Settings" };

export default function Page() {
  return (
    <Suspense>
      <EditBusinessDetailsView />
    </Suspense>
  );
}
