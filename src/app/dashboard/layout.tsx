import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Sidebar from "@/components/dashboard/Sidebar";
import AuthClientShell from "@/components/auth/AuthClientShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen min-h-[100dvh] bg-slate-50">
      <AuthClientShell />
      <Sidebar role={session.role} username={session.username} />
      {/*
        Mobile: reserve space below fixed header (approx. header + touch bar safe area ceiling).
        Desktop: lg+ sidebar is in-flow; flush top padding aligned with sidebar content.
      */}
      <main className="min-w-0 flex-1 overflow-x-hidden px-4 pb-10 pt-[calc(env(safe-area-inset-top,0px)+4.75rem)] sm:px-6 sm:pb-12 lg:px-8 lg:pb-10 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
