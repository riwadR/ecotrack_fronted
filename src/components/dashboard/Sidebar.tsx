"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";
import { Role } from "@/models/user";

type NavLink = {
  href: string;
  label: string;
  roles: Role[]; // quels rôles peuvent voir ce lien
};

const NAV_LINKS: NavLink[] = [
  {
    href: "/dashboard",
    label: "🏠 Dashboard",
    roles: ["ADMIN", "GESTIONNAIRE", "AGENT", "CITOYEN"],
  },
  {
    href: "/dashboard/capteurs",
    label: "📡 Capteurs",
    roles: ["ADMIN", "GESTIONNAIRE", "AGENT"],
  },
  {
    href: "/dashboard/collectes",
    label: "🗑️ Collectes",
    roles: ["ADMIN", "GESTIONNAIRE", "AGENT"],
  },
  {
    href: "/dashboard/alertes",
    label: "⚠️ Alertes",
    roles: ["ADMIN", "GESTIONNAIRE"],
  },
  {
    href: "/dashboard/users",
    label: "👥 Utilisateurs",
    roles: ["ADMIN", "GESTIONNAIRE"],
  },
  {
    href: "/dashboard/profile",
    label: "👤 Profil",
    roles: ["ADMIN", "GESTIONNAIRE", "AGENT", "CITOYEN"],
  },
];

const ROLE_BADGE: Record<Role, { label: string; color: string }> = {
  ADMIN:        { label: "Admin",        color: "#ef4444" },
  GESTIONNAIRE: { label: "Gestionnaire", color: "#8b5cf6" },
  AGENT:        { label: "Agent",        color: "#0ea5e9" },
  CITOYEN:      { label: "Citoyen",      color: "#16a34a" },
};

type SidebarProps = {
  role: Role;
  name: string;
};

export default function Sidebar({ role, name }: SidebarProps) {
  const pathname = usePathname();
  const badge = ROLE_BADGE[role];

  return (
    <aside
      style={{
        width: "240px",
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "#ffffff",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Top */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Logo + user info */}
        <div style={{ padding: "0 8px" }}>
          <h2 style={{ margin: "0 0 12px", color: "#4ade80" }}>🌿 EcoTrack</h2>
          <div
            style={{
              background: "#1e293b",
              borderRadius: "10px",
              padding: "10px 12px",
            }}
          >
            <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: "13px" }}>
              {name}
            </p>
            <span
              style={{
                background: badge.color,
                color: "#fff",
                fontSize: "11px",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "999px",
              }}
            >
              {badge.label}
            </span>
          </div>
        </div>

        {/* Navigation filtrée par rôle */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {NAV_LINKS.filter((link) => link.roles.includes(role)).map(
            ({ href, label }) => {
              const isActive =
                href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    color: isActive ? "#ffffff" : "#94a3b8",
                    textDecoration: "none",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: isActive ? 600 : 400,
                    backgroundColor: isActive ? "#1e3a5f" : "transparent",
                    borderLeft: isActive
                      ? "3px solid #4ade80"
                      : "3px solid transparent",
                  }}
                >
                  {label}
                </Link>
              );
            }
          )}
        </nav>
      </div>

      {/* Logout */}
      <div style={{ borderTop: "1px solid #1e293b", paddingTop: "16px" }}>
        <LogoutButton />
      </div>
    </aside>
  );
}