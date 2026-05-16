import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PAGE_DESCRIPTION_CLASS, PAGE_TITLE_CLASS } from "@/lib/ui/appChrome";
import { getUsers } from "@/services/api/users";
import AdminUsersWorkspace from "@/components/users/AdminUsersWorkspace";

export default async function AdminUsersPage() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/dashboard/unauthorized");
  }

  const users = await getUsers();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className={PAGE_TITLE_CLASS}>Utilisateurs &amp; alertes</h1>
        <p className={PAGE_DESCRIPTION_CLASS}>
          Gestion des comptes EcoTrack —{" "}
          <strong className="text-emerald-600">{users.length}</strong> comptes
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <AdminUsersWorkspace initialUsers={users} currentUserId={session.id} />
      </div>
    </div>
  );
}
