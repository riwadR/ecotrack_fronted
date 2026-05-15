"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { PAGE_STACK_CLASS, SECTION_TITLE_CLASS } from "@/lib/ui/appChrome";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const KPI_DATA = [
  { label: "CO2 ce mois", value: "69 kg", color: "#16a34a" },
  { label: "vs mois dernier", value: "-18%", color: "#0ea5e9" },
  { label: "Objectif mensuel", value: "✓ Atteint", color: "#8b5cf6" },
];

export default function CarbonStatsChart() {
  const lineData = {
    labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"],
    datasets: [
      {
        label: "Émissions CO2 (kg)",
        data: [120, 98, 110, 87, 76, 69],
        borderColor: "#16a34a",
        backgroundColor: "rgba(22, 163, 74, 0.15)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#16a34a",
        pointRadius: 5,
      },
    ],
  };

  const barData = {
    labels: ["Transport", "Énergie", "Déchets", "Alimentation"],
    datasets: [
      {
        label: "kg CO2",
        data: [32, 20, 10, 7],
        backgroundColor: ["#16a34a", "#0ea5e9", "#f59e0b", "#8b5cf6"],
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.04)" },
      },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className={`mx-auto mt-8 w-full max-w-[600px] ${PAGE_STACK_CLASS}`}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {KPI_DATA.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-slate-100 bg-white p-4 text-center shadow-md shadow-slate-200/30 border-t-[3px] border-t-solid"
            style={{ borderTopColor: kpi.color }}
          >
            <p
              className="m-0 text-[22px] font-bold"
              style={{ color: kpi.color }}
            >
              {kpi.value}
            </p>
            <p className="m-0 mt-1 text-xs text-slate-600">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/40">
        <h2 className={`${SECTION_TITLE_CLASS} mb-5`}>
          📈 Évolution des émissions (6 mois)
        </h2>
        <Line data={lineData} options={chartOptions} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/40">
        <h2 className={`${SECTION_TITLE_CLASS} mb-5`}>
          🗂️ Répartition par catégorie (ce mois)
        </h2>
        <Bar data={barData} options={chartOptions} />
      </div>
    </div>
  );
}
