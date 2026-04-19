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
    <div style={{ maxWidth: "600px", margin: "32px auto 0", display: "grid", gap: "24px" }}>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
        {KPI_DATA.map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "16px",
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              borderTop: `3px solid ${kpi.color}`,
            }}
          >
            <p style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: kpi.color }}>
              {kpi.value}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>
              {kpi.label}
            </p>
          </div>
        ))}
      </div>

      {/* Line Chart */}
      <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
        <h2 style={{ margin: "0 0 20px", fontSize: "16px", color: "#0f172a" }}>
          📈 Évolution des émissions (6 mois)
        </h2>
        <Line data={lineData} options={chartOptions} />
      </div>

      {/* Bar Chart */}
      <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
        <h2 style={{ margin: "0 0 20px", fontSize: "16px", color: "#0f172a" }}>
          🗂️ Répartition par catégorie (ce mois)
        </h2>
        <Bar data={barData} options={chartOptions} />
      </div>

    </div>
  );
}