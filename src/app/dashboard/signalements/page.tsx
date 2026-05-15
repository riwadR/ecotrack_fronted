import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import ReportsPage from "@/components/reports/ReportsPage";

export default async function SignalementsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (session.role !== "CITIZEN" && session.role !== "AGENT") {
    redirect("/dashboard/unauthorized");
  }

  return <ReportsPage viewerRole={session.role} />;
}
