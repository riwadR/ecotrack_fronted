import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { UserList } from "@/components/users/UserList";

const MOCK_USERS = [
  { id: "1", name: "Alice Martin",  email: "alice@ecotrack.com",       role: "AGENT"        as const },
  { id: "2", name: "Bob Durand",    email: "bob@ecotrack.com",         role: "CITOYEN"      as const },
  { id: "3", name: "Carla Dupont",  email: "carla@ecotrack.com",       role: "GESTIONNAIRE" as const },
  { id: "4", name: "David Leroy",   email: "david@ecotrack.com",       role: "ADMIN"        as const },
];

export default async function DashboardUsersPage() {
  const session = await getSession();

  // Double vérification côté serveur
  if (!session || !["ADMIN", "GESTIONNAIRE"].includes(session.role)) {
    redirect("/dashboard/unauthorized");
  }

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <div>
        <h1 style={{ color: "#0f172a", margin: "0 0 4px" }}>Utilisateurs</h1>
        <p style={{ color: "#64748b", margin: 0 }}>
          Gestion des comptes EcoTrack —{" "}
          <strong style={{ color: "#0ea5e9" }}>{MOCK_USERS.length}</strong> comptes
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
        <UserList users={MOCK_USERS} />
      </div>
    </div>
  );
}