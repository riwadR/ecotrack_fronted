"use client";

import { User } from "@/models/user"
import { UserList } from "@/components/users/UserList";

// Données mockées en attendant le backend
const MOCK_USERS = [
  { id: "1", name: "Alice Martin", email: "alice@ecotrack.com" },
  { id: "2", name: "Bob Durand", email: "bob@ecotrack.com" },
  { id: "3", name: "Carla Dupont", email: "carla@ecotrack.com" },
];

export default function DashboardUsersPage() {
  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <div>
        <h1 style={{ color: "#0f172a", margin: "0 0 4px" }}>Utilisateurs</h1>
        <p style={{ color: "#64748b", margin: 0 }}>Gestion des comptes EcoTrack</p>
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