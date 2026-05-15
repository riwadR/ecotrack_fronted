import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import NewZoneClientPage from "@/components/zones/NewZoneClientPage";

export default async function NewInfrastructureZoneRoutePage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  if (!["ADMIN", "MANAGER"].includes(session.role)) {
    redirect("/dashboard/unauthorized");
  }

  return <NewZoneClientPage />;
}
