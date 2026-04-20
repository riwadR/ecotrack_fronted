import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: "16px",
        textAlign: "center",
      }}
    >
      <span style={{ fontSize: "56px" }}>🚫</span>
      <h1 style={{ color: "#0f172a", margin: 0 }}>Accès refusé</h1>
      <p style={{ color: "#64748b", maxWidth: "360px", margin: 0 }}>
        Tu n'as pas les droits nécessaires pour accéder à cette page.
        Contacte un administrateur si tu penses que c'est une erreur.
      </p>
      <Link
        href="/dashboard"
        style={{
          marginTop: "8px",
          padding: "10px 24px",
          backgroundColor: "#0f172a",
          color: "#ffffff",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: 600,
          fontSize: "14px",
        }}
      >
        ← Retour au dashboard
      </Link>
    </div>
  );
}