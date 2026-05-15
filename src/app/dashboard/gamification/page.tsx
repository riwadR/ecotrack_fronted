import { redirect } from "next/navigation";
import GamificationDashboard from "@/components/gamification/GamificationDashboard";
import { getSession } from "@/lib/auth";

export default async function GamificationPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "CITIZEN") redirect("/dashboard/unauthorized");

  return <GamificationDashboard />;
}
