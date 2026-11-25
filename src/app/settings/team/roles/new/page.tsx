import { Suspense } from "react";
import { CreateRoleView } from "@/features/team/CreateRoleView";

export const metadata = { title: "Create custom role · Settings" };

export default function Page() {
  return (
    <Suspense>
      <CreateRoleView />
    </Suspense>
  );
}
