"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import LogoutButton from "@/components/auth/LogoutButton";
import { Role } from "@/models/user";

type NavLink = { href: string; label: string; roles: Role[] };

const NAV_LINKS: NavLink[] = [
  { href: "/dashboard",           label: "🏠 Dashboard",    roles: ["ADMIN", "MANAGER", "AGENT", "CITIZEN"] },
  { href: "/dashboard/capteurs",  label: "📡 Capteurs",     roles: ["ADMIN", "MANAGER", "AGENT"] },
  { href: "/dashboard/collectes", label: "🗑️ Collectes",   roles: ["ADMIN", "MANAGER", "AGENT"] },
  { href: "/dashboard/alertes",   label: "⚠️ Alertes",     roles: ["ADMIN", "MANAGER"] },
  { href: "/dashboard/users",     label: "👥 Utilisateurs", roles: ["ADMIN"] },
  { href: "/dashboard/profile",   label: "👤 Profil",       roles: ["ADMIN", "MANAGER", "AGENT", "CITIZEN"] },
  { href: "/dashboard/zones", label: "📍 Zones", roles: ["ADMIN", "MANAGER", "AGENT"] },
  { href: "/dashboard/map", label: "🗺️ Carte", roles: ["ADMIN", "MANAGER", "AGENT", "CITIZEN"] },
  { href: "/dashboard/signalements", label: "📢 Signalements", roles: ["AGENT", "CITIZEN"] },
  { href: "/dashboard/gamification", label: "Gamification", roles: ["CITIZEN"] },
  { href: "/dashboard/classement", label: "Classement", roles: ["ADMIN", "MANAGER", "AGENT", "CITIZEN"] },
];

const ROLE_BADGE: Record<Role, { label: string; color: string }> = {
  ADMIN:        { label: "Admin",        color: "#ef4444" },
  MANAGER:      { label: "Gestionnaire", color: "#8b5cf6" },
  AGENT:        { label: "Agent",        color: "#0ea5e9" },
  CITIZEN:      { label: "Citoyen",      color: "#16a34a" },
};

export default function Sidebar({ role, name }: { role: Role; name: string }) {
  const pathname = usePathname();
  const badge = ROLE_BADGE[role];
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const navContent = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px" }}>
          <h2 style={{ margin: 0, color: "#4ade80", fontSize: "18px" }}>🌿 EcoTrack</h2>
          {isMobile && (
            <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: "20px", cursor: "pointer" }}>✕</button>
          )}
        </div>

        {/* User card */}
        <div style={{ background: "#1e293b", borderRadius: "10px", padding: "10px 12px", margin: "0 8px" }}>
          <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: "13px", color: "#fff" }}>{name}</p>
          <span style={{ background: badge.color, color: "#fff", fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "999px" }}>
            {badge.label}
          </span>
        </div>

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {NAV_LINKS.filter((l) => l.roles.includes(role)).map(({ href, label }) => {
            const isActive = href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => {
                  if (isMobile) setIsOpen(false);
                }}
                style={{
                  color: isActive ? "#ffffff" : "#94a3b8",
                  textDecoration: "none",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: isActive ? 600 : 400,
                  backgroundColor: isActive ? "#1e3a5f" : "transparent",
                  borderLeft: isActive ? "3px solid #4ade80" : "3px solid transparent",
                  display: "block",
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div style={{ borderTop: "1px solid #1e293b", paddingTop: "16px" }}>
        <LogoutButton />
      </div>
    </div>
  );

  // ── DESKTOP ──
  if (!isMobile) {
    return (
      <aside style={{ width: "240px", minHeight: "100vh", backgroundColor: "#0f172a", color: "#fff", padding: "24px 16px", flexShrink: 0 }}>
        {navContent}
      </aside>
    );
  }

  // ── MOBILE ──
  return (
    <>
      {/* Topbar mobile */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, backgroundColor: "#0f172a", padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={() => setIsOpen(true)}
          style={{ background: "none", border: "none", color: "#fff", fontSize: "22px", cursor: "pointer", lineHeight: 1 }}
          aria-label="Ouvrir le menu"
        >
          ☰
        </button>
        <span style={{ color: "#4ade80", fontWeight: 700, fontSize: "16px" }}>🌿 EcoTrack</span>
      </div>

      {/* Spacer pour compenser la topbar fixe */}
      <div style={{ height: "52px", width: "100%" }} />

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 40 }}
        />
      )}

      {/* Drawer */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: isOpen ? 0 : "-280px",
          width: "260px",
          height: "100vh",
          backgroundColor: "#0f172a",
          color: "#fff",
          padding: "24px 16px",
          zIndex: 50,
          transition: "left 0.25s ease",
          overflowY: "auto",
        }}
      >
        {navContent}
      </aside>
    </>
  );
}