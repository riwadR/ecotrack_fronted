import DashboardKPIs from "@/components/dashboard/DashboardKPIs";
import DashboardOverviewChart from "@/components/dashboard/DashboardOverviewChart";

export default function DashboardPage() {
  return (
    <div style={{ display: "grid", gap: "32px" }}>
      <div>
        <h1 style={{ color: "#0f172a", margin: "0 0 4px" }}>Tableau de bord</h1>
        <p style={{ color: "#64748b", margin: 0 }}>Vue globale EcoTrack</p>
      </div>
      <DashboardKPIs />
      <DashboardOverviewChart />
    </div>
  );
}