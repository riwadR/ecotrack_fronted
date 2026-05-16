import { redirect } from "next/navigation";

export default function DashboardUsersLegacyRedirect() {
  redirect("/dashboard/admin/users");
}
