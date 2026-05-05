import { getSession } from "@/lib/auth";
import MapPage from "@/components/map/MapPage";

export default async function DashboardMapPage() {
  const session = await getSession();
  if (!session) {
    return null;
  }

  return <MapPage viewerRole={session.role} />;
}
