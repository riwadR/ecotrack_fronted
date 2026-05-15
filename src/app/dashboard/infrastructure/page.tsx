import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import ZonesManagementPage from "@/components/zones/ZonesManagementPage";

export default async function InfrastructureRoutePage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  if (!["ADMIN", "MANAGER", "AGENT"].includes(session.role)) {
    redirect("/dashboard/unauthorized");
  }

  return <ZonesManagementPage viewerRole={session.role} />;
}
