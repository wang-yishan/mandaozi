"use client";

import { Check, Route } from "lucide-react";
import { useMadaraStore } from "@/store/madara-store";
import type { RoadmapDef } from "../types/roadmap";

interface Props {
  roadmap: RoadmapDef;
  className?: string;
  size?: "sm" | "md";
}

export function RoadmapPathSelectButton({
  roadmap,
  className = "",
  size = "md",
}: Props) {
  const selectedPathRoadmapId = useMadaraStore((s) => s.selectedPathRoadmapId);
  const setSelectedPathRoadmapId = useMadaraStore(
    (s) => s.setSelectedPathRoadmapId,
  );

  const isActive = selectedPathRoadmapId === roadmap.id;
  const hasOtherPath =
    selectedPathRoadmapId !== null && selectedPathRoadmapId !== roadmap.id;

  const label = isActive
    ? "Path aktif"
    : hasOtherPath
      ? "Ganti path"
      : "Jalani roadmap ini";

  const base =
    size === "sm" ? "min-h-[40px] px-3 text-sm" : "min-h-[44px] px-4 text-sm";

  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={() => setSelectedPathRoadmapId(isActive ? null : roadmap.id)}
      className={`inline-flex items-center justify-center gap-2 rounded-[14px] font-bold transition-colors ${
        isActive
          ? "border border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
          : "bg-[var(--primary)] text-white"
      } ${base} ${className}`}
      title={
        isActive
          ? "Klik untuk melepas path aktif"
          : hasOtherPath
            ? `Ganti path aktif ke ${roadmap.title}`
            : `Jadikan ${roadmap.title} sebagai path aktif`
      }
    >
      {isActive ? <Check size={16} /> : <Route size={16} />}
      {label}
    </button>
  );
}
