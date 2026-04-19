const KPIS = [
  { label: "Capteurs actifs", value: "1 842", icon: "📡", color: "#0ea5e9" },
  { label: "Collectes aujourd'hui", value: "348", icon: "🗑️", color: "#16a34a" },
  { label: "CO2 évité (mois)", value: "4.2 T", icon: "🌿", color: "#8b5cf6" },
  { label: "Alertes en cours", value: "7", icon: "⚠️", color: "#f59e0b" },
];

export default function DashboardKPIs() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
      }}
    >
      {KPIS.map((kpi) => (
        <div
          key={kpi.label}
          style={{
            background: "#fff",
            borderRadius: "14px",
            padding: "20px 24px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            borderTop: `3px solid ${kpi.color}`,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "28px" }}>{kpi.icon}</span>
          <p style={{ margin: 0, fontSize: "28px", fontWeight: 700, color: kpi.color }}>
            {kpi.value}
          </p>
          <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>{kpi.label}</p>
        </div>
      ))}
    </div>
  );
}