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
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <AuthClientShell />
      <Sidebar role={session.role} username={session.username} />
      <main
        style={{
          flex: 1,
          padding: "24px",
          minWidth: 0, // évite overflow sur flex
          overflowX: "hidden",
        }}
      >
        {children}
      </main>
    </div>
  );
}