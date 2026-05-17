"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import LogoutButton from "@/components/auth/LogoutButton";
import { Role } from "@/models/user";

type NavLink = { href: string; label: string; roles: Role[] };

const NAV_LINKS: NavLink[] = [
  { href: "/dashboard", label: "🏠 Dashboard", roles: ["ADMIN", "MANAGER", "AGENT", "CITIZEN"] },
  { href: "/dashboard/capteurs", label: "📡 Capteurs", roles: ["ADMIN", "MANAGER", "AGENT"] },
  { href: "/dashboard/collectes", label: "🗑️ Collectes", roles: ["ADMIN", "MANAGER", "AGENT"] },
  { href: "/dashboard/alertes", label: "⚠️ Alertes", roles: ["ADMIN", "MANAGER"] },
  { href: "/dashboard/admin/users", label: "👥 Utilisateurs", roles: ["ADMIN"] },
  { href: "/dashboard/profile", label: "👤 Profil", roles: ["ADMIN", "MANAGER", "AGENT", "CITIZEN"] },
  {
    href: "/dashboard/infrastructure",
    label: "📍 Zones & Conteneurs",
    roles: ["ADMIN", "MANAGER", "AGENT"],
  },
  {
    href: "/dashboard/signalements",
    label: "🗺️ Carte & Signalements",
    roles: ["CITIZEN"],
  },
  {
    href: "/dashboard/reports-management",
    label: "📋 Gestion signalements",
    roles: ["ADMIN"],
  },
  { href: "/dashboard/gamification", label: "Gamification", roles: ["CITIZEN"] },
  { href: "/dashboard/challenges", label: "🏆 Défis", roles: ["CITIZEN"] },
  {
    href: "/dashboard/admin/challenges",
    label: "🏆 Gestion défis",
    roles: ["ADMIN"],
  },
  { href: "/dashboard/classement", label: "Classement", roles: ["ADMIN", "MANAGER", "AGENT", "CITIZEN"] },
];

const ROLE_BADGE: Record<Role, { label: string; color: string }> = {
  ADMIN: { label: "Admin", color: "#ef4444" },
  MANAGER: { label: "Gestionnaire", color: "#8b5cf6" },
  AGENT: { label: "Agent", color: "#0ea5e9" },
  CITIZEN: { label: "Citoyen", color: "#16a34a" },
};

function navLinkClassName(isActive: boolean): string {
  return [
    "flex min-h-[44px] items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors lg:py-3",
    isActive ? "border-l-[3px] border-emerald-400 bg-slate-800 text-white" : "border-l-[3px] border-transparent text-slate-400 hover:bg-slate-800/70 hover:text-white",
  ].join(" ");
}

type SidebarProps = { role: Role; username: string };

/**
 * Responsive shell navigation: persistent left sidebar from `lg` breakpoint up;
 * below `lg`, a fixed top bar with hamburger opens a sliding drawer over an overlay.
 */
export default function Sidebar({ role, username }: SidebarProps) {
  const pathname = usePathname();
  const badge = ROLE_BADGE[role];
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Close drawer on route change (internal navigation).
  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  // Close on Escape when drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobile();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen, closeMobile]);

  const filteredLinks = NAV_LINKS.filter((link) => link.roles.includes(role));

  const BrandMark = ({ className = "" }: { className?: string }) => (
    <span className={`font-bold text-emerald-400 ${className}`}>🌿 EcoTrack</span>
  );

  const renderNavLinks = (onNavigate: () => void) =>
    filteredLinks.map(({ href, label }) => {
      const isActive =
        href === "/dashboard"
          ? pathname === "/dashboard" || pathname === "/dashboard/"
          : pathname.startsWith(href);
      return (
        <Link
          key={href}
          href={href}
          onClick={() => {
            onNavigate();
          }}
          className={navLinkClassName(isActive)}
        >
          {label}
        </Link>
      );
    });

  /** Shared user summary block shown in sidebar and drawer. */
  const UserCard = ({ className }: { className?: string }) => (
    <div className={`rounded-xl bg-slate-800 p-3 ${className ?? ""}`}>
      <p className="m-0 text-sm font-semibold text-white">{username}</p>
      <span
        className="mt-2 inline-block rounded-full px-2 py-1 text-[11px] font-semibold text-white"
        style={{ backgroundColor: badge.color }}
      >
        {badge.label}
      </span>
    </div>
  );

  return (
    <>
      {/* Mobile / tablet top bar (< lg): hamburger triggers drawer */}
      <header className="fixed inset-x-0 top-0 z-[10001] flex min-h-[3.25rem] items-center gap-3 border-b border-slate-800 bg-slate-900 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))] shadow-sm lg:hidden">
        <button
          type="button"
          className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg bg-slate-800 text-xl text-white transition hover:bg-slate-700"
          aria-expanded={mobileOpen}
          aria-controls="dashboard-mobile-drawer"
          aria-label="Ouvrir le menu"
          onClick={() => setMobileOpen(true)}
        >
          ☰
        </button>
        <BrandMark className="truncate text-base" />
      </header>

      {/* Desktop sidebar (lg+): fixed column in flex shell */}
      <aside className="relative z-30 hidden min-h-screen w-60 shrink-0 flex-col border-r border-slate-800 bg-slate-900 p-6 text-white lg:sticky lg:top-0 lg:flex lg:max-h-svh lg:overflow-y-auto">
        <div className="flex flex-none items-center gap-2 px-1 pb-6">
          <BrandMark className="text-lg" />
        </div>
        <UserCard className="mb-6" />
        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1" aria-label="Navigation principale">
          {renderNavLinks(() => undefined)}
        </nav>
        <div className="mt-6 shrink-0 border-t border-slate-800 pt-4">
          <LogoutButton variant="desktop" />
        </div>
      </aside>

      {/* Mobile drawer + overlay */}
      {mobileOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[10000] cursor-default bg-slate-950/55 backdrop-blur-[1px] lg:hidden"
            aria-label="Fermer le menu"
            onClick={closeMobile}
          />

          <aside
            id="dashboard-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dashboard-drawer-title"
            className="fixed inset-y-0 left-0 z-[10002] flex w-[min(20rem,calc(100vw-3rem))] max-w-[90vw] flex-col border-r border-slate-800 bg-slate-900 p-5 text-white shadow-2xl lg:hidden"
          >
            <div className="flex flex-none shrink-0 items-start justify-between gap-2 pb-4 pt-[max(0.5rem,env(safe-area-inset-top,0px))]">
              <h2 id="dashboard-drawer-title" className="m-0 text-lg font-bold text-emerald-400">
                🌿 Menu
              </h2>
              <button
                type="button"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-800 hover:text-white"
                aria-label="Fermer le menu"
                onClick={closeMobile}
              >
                ✕
              </button>
            </div>

            <UserCard className="mb-5" />

            <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1" aria-label="Navigation principale">
              {renderNavLinks(closeMobile)}
            </nav>

            <div className="shrink-0 border-t border-slate-800 pb-[env(safe-area-inset-bottom,0px)] pt-4">
              <LogoutButton variant="mobile-drawer" onLogoutStart={closeMobile} />
            </div>
          </aside>
        </>
      ) : null}
    </>
  );
}
