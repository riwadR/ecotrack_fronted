"use client";

import dynamic from "next/dynamic";

const DashboardIoTSupervision = dynamic(
  () => import("@/components/dashboard/DashboardIoTSupervision"),
  { ssr: false }
);

export default function DashboardControlTower() {
  return <DashboardIoTSupervision />;
}
