import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8fafc",
        padding: "24px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "#ffffff",
          padding: "32px",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            marginBottom: "12px",
            color: "#0f172a",
            textAlign: "center",
          }}
        >
          Connexion
        </h1>

        <p
          style={{
            marginBottom: "24px",
            color: "#475569",
            textAlign: "center",
          }}
        >
          Connecte-toi pour accéder à la page users.
        </p>

        <LoginForm />

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <p style={{ color: "#64748b", marginBottom: "12px" }}>
            Pas encore de compte ?
          </p>

          <Link
            href="/register"
            style={{
              display: "inline-block",
              padding: "12px 20px",
              backgroundColor: "#16a34a",
              color: "#ffffff",
              textDecoration: "none",
              borderRadius: "10px",
              fontWeight: 600,
            }}
          >
            Inscription
          </Link>
        </div>
      </section>
    </main>
  );
}
