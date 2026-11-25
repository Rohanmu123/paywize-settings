import { Suspense } from "react";
import { EditMemberView } from "@/features/team/EditMemberView";

export const metadata = { title: "Edit member · Settings" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <EditMemberView id={id} />
    </Suspense>
  );
}
