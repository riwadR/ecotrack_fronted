import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import CollectesPageClient from "@/components/collectes/CollectesPageClient";

export default async function CollectesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (
    session.role !== "ADMIN" &&
    session.role !== "MANAGER" &&
    session.role !== "AGENT"
  ) {
    redirect("/dashboard/unauthorized");
  }

  return <CollectesPageClient role={session.role} />;
}
