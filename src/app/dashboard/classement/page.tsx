import { redirect } from "next/navigation";
import LeaderboardDashboard from "@/components/gamification/LeaderboardDashboard";
import { getSession } from "@/lib/auth";

export default async function LeaderboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return <LeaderboardDashboard />;
}
