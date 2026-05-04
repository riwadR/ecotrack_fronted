"use client";

import { User } from "@/models/user";

type UserListProps = {
  users: User[];
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const COLORS = ["#0ea5e9", "#16a34a", "#8b5cf6", "#f59e0b", "#ef4444"];

export function UserList({ users }: UserListProps) {
  if (users.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px", color: "#94a3b8" }}>
        <p style={{ fontSize: "40px", margin: "0 0 12px" }}>👤</p>
        <p style={{ margin: 0, fontWeight: 600, color: "#64748b" }}>Aucun utilisateur</p>
        <p style={{ margin: "4px 0 0", fontSize: "14px" }}>
          Les utilisateurs apparaîtront ici une fois l&apos;API connectée.
        </p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 2fr 1fr",
          padding: "10px 16px",
          borderBottom: "1px solid #e2e8f0",
          color: "#94a3b8",
          fontSize: "12px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        <span>Utilisateur</span>
        <span>Email</span>
        <span>Statut</span>
      </div>

      {/* Rows */}
      {users.map((user, i) => {
        const color = COLORS[i % COLORS.length];
        return (
          <div
            key={user.id}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 2fr 1fr",
              padding: "14px 16px",
              borderBottom: "1px solid #f1f5f9",
              alignItems: "center",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#f8fafc")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            {/* Avatar + Nom */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: color,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "13px",
                  flexShrink: 0,
                }}
              >
                {getInitials(user.name)}
              </div>
              <span style={{ fontWeight: 600, color: "#0f172a", fontSize: "14px" }}>
                {user.name}
              </span>
            </div>

            {/* Email */}
            <span style={{ color: "#64748b", fontSize: "14px" }}>{user.email}</span>

            {/* Badge statut */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                background: "#dcfce7",
                color: "#16a34a",
                fontSize: "12px",
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: "999px",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#16a34a",
                  display: "inline-block",
                }}
              />
              Actif
            </span>
          </div>
        );
      })}

      {/* Footer */}
      <div style={{ padding: "12px 16px", color: "#94a3b8", fontSize: "13px" }}>
        {users.length} utilisateur{users.length > 1 ? "s" : ""}
      </div>
    </div>
  );
}