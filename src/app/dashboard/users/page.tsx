import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { UserList } from "@/components/users/UserList";
import { PAGE_DESCRIPTION_CLASS, PAGE_TITLE_CLASS } from "@/lib/ui/appChrome";
import { getUsers } from "@/services/api/users";

export default async function DashboardUsersPage() {
  const session = await getSession();

  // Double vérification côté serveur
  if (!session || !["ADMIN"].includes(session.role)) {
    redirect("/dashboard/unauthorized");
  }

  const users = await getUsers();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className={PAGE_TITLE_CLASS}>Utilisateurs</h1>
        <p className={PAGE_DESCRIPTION_CLASS}>
          Gestion des comptes EcoTrack —{" "}
          <strong className="text-emerald-600">{users.length}</strong> comptes
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <UserList users={users} />
      </div>
    </div>
  );
}
