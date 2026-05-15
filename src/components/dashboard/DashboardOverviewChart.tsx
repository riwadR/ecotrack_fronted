"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);

/**
 * Last-7-days activity chart — fixed-height canvas container keeps layout stable on phones when `maintainAspectRatio` is disabled.
 */
export default function DashboardOverviewChart() {
  const data = {
    labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
    datasets: [
      {
        label: "Collectes",
        data: [310, 290, 348, 320, 360, 210, 180],
        borderColor: "#16a34a",
        backgroundColor: "rgba(22,163,74,0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#16a34a",
        pointRadius: 4,
      },
      {
        label: "Alertes",
        data: [5, 8, 7, 3, 9, 2, 4],
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245,158,11,0.08)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#f59e0b",
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: { boxWidth: 12 },
      },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.04)" } },
      x: { grid: { display: false } },
    },
  };

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5 md:p-6">
      <h2 className="m-0 mb-5 text-base font-semibold leading-tight text-slate-900 sm:mb-6 md:text-lg">
        📊 Activité des 7 derniers jours
      </h2>
      <div className="relative mx-auto h-56 min-h-[14rem] w-full max-w-full sm:h-[18rem] md:h-80 md:max-w-none">
        <Line data={data} options={options} aria-label="Graphique ligne des collectes et alertes par jour" />
      </div>
    </section>
  );
}
