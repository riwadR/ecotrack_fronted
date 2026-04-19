import ProfileCard from "@/components/profile/ProfileCard";
import CarbonStatsChart from "@/components/profile/CarbonStatsChart";

export default function DashboardProfilePage() {
  return (
    <main style={{ minHeight: "100vh", padding: "40px 24px", backgroundColor: "#f8fafc" }}>
      <ProfileCard
        firstName="Maeva"
        lastName="Utilisateur"
        email="maeva@ecotrack.com"
      />
      <CarbonStatsChart />
    </main>
  );
}