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

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Tooltip, Legend, Filler
);

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

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
      }}
    >
      <h2 style={{ margin: "0 0 20px", fontSize: "16px", color: "#0f172a" }}>
        📊 Activité des 7 derniers jours
      </h2>
      <Line
        data={data}
        options={{
          responsive: true,
          plugins: { legend: { position: "top" } },
          scales: {
            y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.04)" } },
            x: { grid: { display: false } },
          },
        }}
      />
    </div>
  );
}