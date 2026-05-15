import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import ReportsManagementPage from "@/components/reports/management/ReportsManagementPage";

export default async function ReportsManagementRoutePage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (session.role !== "ADMIN" && session.role !== "AGENT") {
    redirect("/dashboard/unauthorized");
  }

  return <ReportsManagementPage />;
}
