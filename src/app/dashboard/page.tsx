import DashboardKPIs from "@/components/dashboard/DashboardKPIs";
import DashboardControlTower from "@/components/dashboard/DashboardControlTower";
import DashboardOverviewChart from "@/components/dashboard/DashboardOverviewChart";
import CitizenGamificationOverview from "@/components/gamification/CitizenGamificationOverview";
import { getSession } from "@/lib/auth";
import { PAGE_DESCRIPTION_CLASS, PAGE_TITLE_CLASS } from "@/lib/ui/appChrome";

/**
 * Authenticated landing view: KPI grid, optional citizen recap, weekly chart — mobile-first typography and spacing only.
 */
export default async function DashboardPage() {
  const session = await getSession();

  return (
    <div className="flex flex-col gap-6 md:gap-8 lg:gap-10">
      <header className="flex flex-col gap-2 px-0.5 md:gap-3">
        <h1 className={PAGE_TITLE_CLASS}>Tableau de bord</h1>
        <p className={PAGE_DESCRIPTION_CLASS}>Vue globale EcoTrack</p>
      </header>

      <DashboardKPIs />

      {session?.role === "ADMIN" || session?.role === "MANAGER" ? (
        <DashboardControlTower />
      ) : null}

      {session?.role === "CITIZEN" ? <CitizenGamificationOverview /> : null}

      <DashboardOverviewChart />
    </div>
  );
}
