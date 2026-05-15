import { redirect } from "next/navigation";
import ChallengesAdminPage from "@/components/challenges/admin/ChallengesAdminPage";
import { getSession } from "@/lib/auth";

export default async function AdminChallengesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (session.role !== "ADMIN") {
    redirect("/dashboard/unauthorized");
  }

  return <ChallengesAdminPage />;
}
