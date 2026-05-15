import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "../../components/auth/LogoutButton";
import { getSession } from "@/lib/auth";
import type { Role } from "@/models/user";
import { PAGE_DESCRIPTION_CLASS, PAGE_TITLE_CLASS } from "@/lib/ui/appChrome";

const roleLabels: Record<Role, string> = {
  ADMIN: "Administrateur",
  MANAGER: "Gestionnaire",
  AGENT: "Agent",
  CITIZEN: "Citoyen",
};

export default async function UsersPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const roleLabel = roleLabels[session.role] ?? session.role;

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-8">
        <h1 className={PAGE_TITLE_CLASS}>Mon compte</h1>
        <p className={PAGE_DESCRIPTION_CLASS}>
          Vous êtes connecté en tant que{" "}
          <span className="font-medium text-slate-800">{session.name}</span> (
          {session.email}
          ). Rôle&nbsp;: {roleLabel}.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Ouvrir le tableau de bord
          </Link>
        </div>
      </section>
      <div className="mx-auto mt-6 max-w-2xl">
        <LogoutButton />
      </div>
    </main>
  );
}
