import { Suspense } from "react";
import { BrandingView } from "@/features/branding/BrandingView";

export const metadata = { title: "Branding · Settings" };

export default function Page() {
  return (
    <Suspense>
      <BrandingView />
    </Suspense>
  );
}
