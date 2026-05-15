import type { ReactNode } from "react";

import type { Role, User } from "@/models/user";

type UserListProps = {
  users: User[];
};

const ROLE_LABEL_FR: Record<Role, string> = {
  ADMIN: "Administrateur",
  MANAGER: "Gestionnaire",
  AGENT: "Agent",
  CITIZEN: "Citoyen",
};

export function UserList({ users }: UserListProps) {
  if (users.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400">
        <p className="m-0 text-[40px] leading-none mb-3">👤</p>
        <p className="m-0 font-semibold text-slate-500">Aucun utilisateur</p>
        <p className="mt-1 text-sm">
          Les utilisateurs apparaîtront ici une fois l&apos;API connectée.
        </p>
      </div>
    );
  }

  const thClass =
    "px-4 py-2.5 text-left text-[12px] font-semibold uppercase tracking-wide text-slate-400";

  const tdRowClass =
    "border-b border-slate-100 px-4 py-3 align-middle transition-colors hover:bg-slate-50/80";

  return (
    <div className="min-w-0">
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className={thClass}>Pseudo</th>
              <th className={thClass}>Prénom</th>
              <th className={thClass}>Nom</th>
              <th className={thClass}>Email</th>
              <th className={thClass}>Rôle</th>
              <th className={thClass}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className={tdRowClass}>
                <td className="font-semibold text-slate-900">{user.username || "—"}</td>
                <td className="text-slate-900">{user.firstName || "—"}</td>
                <td className="text-slate-900">{user.lastName || "—"}</td>
                <td className="text-slate-500">{user.email}</td>
                <td className="text-slate-900">{ROLE_LABEL_FR[user.role] ?? user.role}</td>
                <td>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
                    <span className="size-1.5 rounded-full bg-green-600" aria-hidden />
                    Actif
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="m-0 list-none space-y-4 p-0 lg:hidden">
        {users.map((user) => (
          <li
            key={user.id}
            className="block rounded-lg border border-slate-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.08)]"
          >
            <div className="flex flex-col divide-y divide-slate-100">
              <MobileField label="Pseudo" value={user.username || "—"} />
              <MobileField label="Prénom" value={user.firstName || "—"} />
              <MobileField label="Nom" value={user.lastName || "—"} />
              <MobileField label="E-mail" value={user.email} />
              <MobileField label="Rôle" value={ROLE_LABEL_FR[user.role] ?? user.role} />
              <MobileField
                label="Statut"
                value={
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
                    <span className="size-1.5 rounded-full bg-green-600" aria-hidden />
                    Actif
                  </span>
                }
              />
            </div>
          </li>
        ))}
      </ul>

      <p className="m-0 border-t border-slate-100 px-1 py-3 text-[13px] text-slate-400 lg:border-0 lg:px-4">
        {users.length} utilisateur{users.length > 1 ? "s" : ""}
      </p>
    </div>
  );
}

function MobileField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
      <span className="shrink-0 text-sm font-semibold text-slate-500">{label} :</span>
      <div className="min-w-0 text-right text-sm text-slate-900">{value}</div>
    </div>
  );
}
