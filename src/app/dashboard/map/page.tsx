import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import MapPage from "@/components/map/MapPage";

export default async function DashboardMapPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  if (session.role !== "ADMIN" && session.role !== "MANAGER") {
    if (session.role === "CITIZEN" || session.role === "AGENT") {
      redirect("/dashboard/signalements");
    }
    redirect("/dashboard/unauthorized");
  }

  return <MapPage viewerRole={session.role} />;
}
