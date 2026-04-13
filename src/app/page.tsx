import Link from "next/link";

export default function HomePage() {
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
          maxWidth: "700px",
          backgroundColor: "#ffffff",
          padding: "32px",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "2rem", marginBottom: "16px", color: "#0f172a" }}>
          Bienvenue sur EcoTrack
        </h1>

        <p style={{ fontSize: "1rem", marginBottom: "24px", color: "#475569" }}>
          Ton frontend Next.js fonctionne. Tu peux maintenant accéder à la page des utilisateurs.
        </p>

        <Link
          href="/users"
          style={{
            display: "inline-block",
            padding: "12px 20px",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            textDecoration: "none",
            borderRadius: "10px",
            fontWeight: 600,
          }}
        >
          Aller vers /users
        </Link>
      </section>
    </main>
  );
}