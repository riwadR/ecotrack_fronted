import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import ZonesManagementPage from "@/components/zones/ZonesManagementPage";

export default async function ZonesRoutePage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return <ZonesManagementPage viewerRole={session.role} />;
}
