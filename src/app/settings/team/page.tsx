import { Suspense } from "react";
import { TeamView } from "@/features/team/TeamView";

export const metadata = { title: "Team & roles · Settings" };

export default function Page() {
  return (
    <Suspense>
      <TeamView />
    </Suspense>
  );
}
