import Link from "next/link";

export default function Sidebar() {
  return (
    <aside
      style={{
        width: "240px",
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "#ffffff",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      <div>
        <h2 style={{ margin: 0 }}>EcoTrack</h2>
        <p style={{ marginTop: "8px", color: "#cbd5e1" }}>Navigation</p>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <Link
          href="/dashboard"
          style={{
            color: "#ffffff",
            textDecoration: "none",
            padding: "10px 12px",
            borderRadius: "8px",
            backgroundColor: "#1e293b",
          }}
        >
          Dashboard
        </Link>

        <Link
          href="/dashboard/profile"
          style={{
            color: "#ffffff",
            textDecoration: "none",
            padding: "10px 12px",
            borderRadius: "8px",
          }}
        >
          Profile
        </Link>

        <Link
          href="/dashboard/users"
          style={{
            color: "#ffffff",
            textDecoration: "none",
            padding: "10px 12px",
            borderRadius: "8px",
          }}
        >
          Users
        </Link>
      </nav>
    </aside>
  );
}