import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
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
          maxWidth: "500px",
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
          Inscription
        </h1>

        <p
          style={{
            marginBottom: "24px",
            color: "#475569",
            textAlign: "center",
          }}
        >
          Crée un compte utilisateur simple pour EcoTrack.
        </p>

        <RegisterForm />
      </section>
    </main>
  );
}