import { redirect } from "next/navigation";
import LogoutButton from "../../components/auth/LogoutButton";
import { getSession } from "@/lib/auth";

export default async function UsersPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
        backgroundColor: "#f8fafc",
      }}
    >
      <section
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          padding: "32px",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ color: "#0f172a", marginBottom: "16px" }}>
          Page Users protégée
        </h1>

        <p style={{ color: "#475569", marginBottom: "24px" }}>
          Tu es connecté, donc tu peux voir cette page.
        </p>

        <ul style={{ color: "#0f172a", paddingLeft: "20px" }}>
          <li>Alice - alice@test.com</li>
          <li>Bob - bob@test.com</li>
          <li>Charlie - charlie@test.com</li>
        </ul>
      </section>
      <LogoutButton />
    </main>
  );
}