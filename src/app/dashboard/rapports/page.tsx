import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import ReportsExportPage from "@/components/reports/export/ReportsExportPage";

export default async function RapportsRoutePage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (session.role !== "ADMIN" && session.role !== "MANAGER") {
    redirect("/dashboard/unauthorized");
  }

  return <ReportsExportPage />;
}
