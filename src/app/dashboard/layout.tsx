import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Sidebar from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) redirect("/login");

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Sidebar role={session.role} name={session.name} />
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