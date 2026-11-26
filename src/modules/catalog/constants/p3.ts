import type { LucideIcon } from "lucide-react";
import { BarChart3, Bell, Map as MapIcon } from "lucide-react";

export type P3Id =
  | "p3-home-insights"
  | "p3-notification-center"
  | "p3-world-journey";

export interface P3Placeholder {
  id: P3Id;
  label: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  source: "#5" | "#7" | "#10";
}

export const P3_PLACEHOLDERS: P3Placeholder[] = [
  {
    id: "p3-home-insights",
    label: "Home Insights",
    title: "#5 Home Insights / Period Filter",
    desc: "Placeholder P3 untuk filter periode Home (Hari Ini/Minggu Ini/Bulan Ini) dan insight dashboard. Fitur ini akan diimplementasikan pada tahap P3 berikutnya.",
    icon: BarChart3,
    source: "#5",
  },
  {
    id: "p3-notification-center",
    label: "Notification Center",
    title: "#7 Notification Center",
    desc: "Placeholder P3 untuk panel notifikasi Home / Notification Center. Fitur ini akan diimplementasikan pada tahap P3 berikutnya.",
    icon: Bell,
    source: "#7",
  },
  {
    id: "p3-world-journey",
    label: "World Journey",
    title: "#10 World Journey",
    desc: "Placeholder P3 untuk penyederhanaan/alur World Journey. Fitur ini akan diimplementasikan pada tahap P3 berikutnya.",
    icon: MapIcon,
    source: "#10",
  },
];

export function getP3Placeholder(id: string) {
  return P3_PLACEHOLDERS.find((p) => p.id === id);
}
