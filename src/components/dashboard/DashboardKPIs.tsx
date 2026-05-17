"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { AlertTriangle, Radio, Trash2, Leaf } from "lucide-react";
import { getContainers } from "@/services/api/containers";
import { getAlerts } from "@/services/api/alerts";
import { getTours } from "@/services/api/tourApi";
import { todayDateRange } from "@/lib/dateFilter";
import {
  DASHBOARD_KPIS_REFRESH_EVENT,
} from "@/lib/dashboard/dashboardEvents";
import { parseBackendContainerStatus } from "@/lib/containers/backendContainerStatus";

type KpiCard = {
  label: string;
  href?: string;
  color: string;
  icon: ReactNode;
  value: string;
};

/**
 * Summary KPI tiles with live counts and deep links to operational pages.
 */
export default function DashboardKPIs() {
  const [activeSensors, setActiveSensors] = useState("—");
  const [toursToday, setToursToday] = useState("—");
  const [activeAlerts, setActiveAlerts] = useState("—");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [containers, tours, alerts] = await Promise.all([
          getContainers(),
          getTours(todayDateRange()),
          getAlerts({ status: "ACTIVE" }),
        ]);
        if (cancelled) {
          return;
        }
        const sensorCount = containers.filter((c) => {
          const status = parseBackendContainerStatus(c.operationalStatus ?? c.status);
          return status !== "MAINTENANCE";
        }).length;
        setActiveSensors(sensorCount.toLocaleString("fr-FR"));
        setToursToday(tours.length.toLocaleString("fr-FR"));
        setActiveAlerts(alerts.length.toLocaleString("fr-FR"));
      } catch {
        if (!cancelled) {
          setActiveSensors("—");
          setToursToday("—");
          setActiveAlerts("—");
        }
      }
    }

    void load();

    const onRefresh = () => {
      void load();
    };
    window.addEventListener(DASHBOARD_KPIS_REFRESH_EVENT, onRefresh);

    return () => {
      cancelled = true;
      window.removeEventListener(DASHBOARD_KPIS_REFRESH_EVENT, onRefresh);
    };
  }, []);

  const cards: KpiCard[] = [
    {
      label: "Capteurs actifs",
      href: "/dashboard/capteurs",
      color: "#0ea5e9",
      icon: <Radio className="h-7 w-7 md:h-8 md:w-8" strokeWidth={1.75} aria-hidden />,
      value: activeSensors,
    },
    {
      label: "Collectes aujourd'hui",
      href: "/dashboard/collectes",
      color: "#16a34a",
      icon: <Trash2 className="h-7 w-7 md:h-8 md:w-8" strokeWidth={1.75} aria-hidden />,
      value: toursToday,
    },
    {
      label: "CO2 évité (mois)",
      color: "#8b5cf6",
      icon: <Leaf className="h-7 w-7 md:h-8 md:w-8" strokeWidth={1.75} aria-hidden />,
      value: "4.2 T",
    },
    {
      label: "Alertes en cours",
      href: "/dashboard/alertes",
      color: "#f59e0b",
      icon: <AlertTriangle className="h-7 w-7 md:h-8 md:w-8" strokeWidth={1.75} aria-hidden />,
      value: activeAlerts,
    },
  ];

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" role="list">
      {cards.map((kpi) => {
        const content = (
          <>
            <span style={{ color: kpi.color }}>{kpi.icon}</span>
            <p
              className="m-0 text-2xl font-bold tabular-nums tracking-tight md:text-3xl"
              style={{ color: kpi.color }}
            >
              {kpi.value}
            </p>
            <p className="m-0 text-sm leading-snug text-slate-600 md:text-[15px]">{kpi.label}</p>
          </>
        );

        const className =
          "flex flex-col gap-2 rounded-xl border-x border-b border-slate-100 border-t-[3px] bg-white px-5 py-5 shadow-sm transition-shadow " +
          (kpi.href ? "cursor-pointer hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600" : "");

        if (kpi.href) {
          return (
            <li key={kpi.label} role="group">
              <Link href={kpi.href} className={`${className} no-underline`} style={{ borderTopColor: kpi.color }}>
                {content}
              </Link>
            </li>
          );
        }

        return (
          <li
            key={kpi.label}
            role="group"
            className={className}
            style={{ borderTopColor: kpi.color }}
          >
            {content}
          </li>
        );
      })}
    </ul>
  );
}
