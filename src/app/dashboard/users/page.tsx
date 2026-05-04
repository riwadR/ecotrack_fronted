import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { UserList } from "@/components/users/UserList";
import { getUsers } from "@/services/api/users";

export default async function DashboardUsersPage() {
  const session = await getSession();

  // Double vérification côté serveur
  if (!session || !["ADMIN"].includes(session.role)) {
    redirect("/dashboard/unauthorized");
  }

  const users = await getUsers();

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <div>
        <h1 style={{ color: "#0f172a", margin: "0 0 4px" }}>Utilisateurs</h1>
        <p style={{ color: "#64748b", margin: 0 }}>
          Gestion des comptes EcoTrack —{" "}
          <strong style={{ color: "#0ea5e9" }}>{users.length}</strong> comptes
        </p>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        }}
      >
        <UserList users={users} />
      </div>
    </div>
  );
}