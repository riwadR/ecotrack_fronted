"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

type MetricsBarChartProps = {
  title: string;
  labels: string[];
  values: number[];
  color?: string;
};

export default function MetricsBarChart({
  title,
  labels,
  values,
  color = "#10b981",
}: MetricsBarChartProps) {
  if (!labels.length) {
    return null;
  }

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: color,
        borderRadius: 6,
        maxBarThickness: 32,
        barPercentage: 0.65,
        categoryPercentage: 0.8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { y: number | null } }) =>
            `${ctx.parsed.y ?? 0}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          font: { size: 10 },
        },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      x: {
        grid: { display: false },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 6,
          font: { size: 10 },
        },
      },
    },
  };

  return (
    <div className="max-w-full rounded-xl border border-slate-100 bg-slate-50/40 p-4">
      <h3 className="m-0 mb-3 text-sm font-semibold text-slate-800">{title}</h3>
      <div className="relative h-64 w-full max-w-full md:h-80">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
