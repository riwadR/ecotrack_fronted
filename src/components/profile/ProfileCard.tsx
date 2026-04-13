type ProfileCardProps = {
  firstName: string;
  lastName: string;
  email: string;
};

export default function ProfileCard({
  firstName,
  lastName,
  email,
}: ProfileCardProps) {
  return (
    <section
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        padding: "32px",
        borderRadius: "16px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
      }}
    >
      <h1 style={{ color: "#0f172a", marginBottom: "24px" }}>Mon profil</h1>

      <div style={{ display: "grid", gap: "16px" }}>
        <div>
          <p style={{ margin: 0, color: "#64748b" }}>Prénom</p>
          <p style={{ margin: 0, color: "#0f172a", fontWeight: 600 }}>
            {firstName}
          </p>
        </div>

        <div>
          <p style={{ margin: 0, color: "#64748b" }}>Nom</p>
          <p style={{ margin: 0, color: "#0f172a", fontWeight: 600 }}>
            {lastName}
          </p>
        </div>

        <div>
          <p style={{ margin: 0, color: "#64748b" }}>Email</p>
          <p style={{ margin: 0, color: "#0f172a", fontWeight: 600 }}>
            {email}
          </p>
        </div>
      </div>
    </section>
  );
}