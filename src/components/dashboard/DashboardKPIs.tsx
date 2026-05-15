const KPIS = [
  { label: "Capteurs actifs", value: "1 842", icon: "📡", color: "#0ea5e9" },
  { label: "Collectes aujourd'hui", value: "348", icon: "🗑️", color: "#16a34a" },
  { label: "CO2 évité (mois)", value: "4.2 T", icon: "🌿", color: "#8b5cf6" },
  { label: "Alertes en cours", value: "7", icon: "⚠️", color: "#f59e0b" },
];

/**
 * Summary KPI tiles for the dashboard home; fluid grid collapses from 4 columns on large desktops.
 */
export default function DashboardKPIs() {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" role="list">
      {KPIS.map((kpi) => (
        <li
          key={kpi.label}
          role="group"
          className="flex flex-col gap-2 rounded-xl border-x border-b border-slate-100 border-t-[3px] bg-white px-5 py-5 shadow-sm"
          style={{ borderTopColor: kpi.color }}
        >
          <span className="text-2xl md:text-[1.85rem]" aria-hidden>
            {kpi.icon}
          </span>
          <p
            className="m-0 text-2xl font-bold tabular-nums tracking-tight md:text-3xl"
            style={{ color: kpi.color }}
          >
            {kpi.value}
          </p>
          <p className="m-0 text-sm leading-snug text-slate-600 md:text-[15px]">{kpi.label}</p>
        </li>
      ))}
    </ul>
  );
}
