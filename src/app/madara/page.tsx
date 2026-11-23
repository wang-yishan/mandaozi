import type { Metadata } from "next";
import { MadaraClient } from "@/features/madara/components/madara-client";

export const metadata: Metadata = {
  title: "Mandaozi — Mandarin Daily Rank",
  description:
    "Mandaozi demo: kosakata, latihan, ranking, dan komunitas belajar Mandarin harian.",
};

export default function MadaraPage() {
  return <MadaraClient />;
}
