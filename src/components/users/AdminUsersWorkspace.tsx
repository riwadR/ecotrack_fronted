"use client";

import { useCallback, useState } from "react";
import type { User } from "@/models/user";
import UserList from "@/components/users/UserList";
import UserAdminEditDrawer from "@/components/users/UserAdminEditDrawer";
import AlertThresholdsConfigPanel from "@/components/users/AlertThresholdsConfigPanel";

type TabId = "users" | "alerts";

type AdminUsersWorkspaceProps = {
  initialUsers: User[];
  currentUserId: string;
};

export default function AdminUsersWorkspace({
  initialUsers,
  currentUserId,
}: AdminUsersWorkspaceProps) {
  const [tab, setTab] = useState<TabId>("users");
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [editing, setEditing] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openEdit = useCallback((user: User) => {
    setEditing(user);
    setDrawerOpen(true);
  }, []);

  const handleSaved = useCallback((updated: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }, []);

  return (
    <div className="grid gap-6">
      <div
        className="flex flex-wrap gap-2 border-b border-slate-200 pb-1"
        role="tablist"
        aria-label="Sections administration utilisateurs"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "users"}
          onClick={() => setTab("users")}
          className={[
            "rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-colors",
            tab === "users"
              ? "bg-white text-emerald-700 ring-1 ring-b-0 ring-slate-200"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
          ].join(" ")}
        >
          Utilisateurs
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "alerts"}
          onClick={() => setTab("alerts")}
          className={[
            "rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-colors",
            tab === "alerts"
              ? "bg-white text-emerald-700 ring-1 ring-b-0 ring-slate-200"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
          ].join(" ")}
        >
          Configuration des alertes
        </button>
      </div>

      {tab === "users" ? (
        <UserList users={users} onEditUser={openEdit} />
      ) : (
        <AlertThresholdsConfigPanel />
      )}

      <UserAdminEditDrawer
        user={editing}
        isOpen={drawerOpen}
        currentUserId={currentUserId}
        onClose={() => {
          setDrawerOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
      />
    </div>
  );
}
