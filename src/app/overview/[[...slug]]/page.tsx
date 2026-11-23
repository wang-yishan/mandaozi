import type { Metadata } from "next";
import { OverviewMount } from "@/features/overview/components/overview-mount";

export const metadata: Metadata = {
  title: "Mandaozi — Mandarin Daily Rank",
  description:
    "Mandaozi overview: kosakata, latihan, ranking, dan komunitas belajar Mandarin harian.",
};

export default function OverviewPage() {
  return <OverviewMount />;
}
