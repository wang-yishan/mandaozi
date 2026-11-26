"use client";

import { ArrowRight, Compass } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { RoadmapNodeVM } from "../types/roadmap";

interface Props {
  node: RoadmapNodeVM | null;
  onSelect: (nodeId: string) => void;
  onOpen: (node: RoadmapNodeVM) => void;
}

export function RoadmapRecommendedNext({ node, onSelect, onOpen }: Props) {
  const hasLink = Boolean(node?.lessonInfo?.href);
  const canOpen = node?.status !== "locked";

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--primary)]">
            <Compass size={14} /> Recommended Next Step
          </div>
          <h2 className="mt-2 text-xl font-black">
            {node ? node.title : "Roadmap completed"}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {node
              ? node.description
              : "You’ve completed every topic in this roadmap. Review any node or continue to your next learning path."}
          </p>
        </div>
      </div>

      {node && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold text-[var(--muted)]">
          <span className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-3 py-1.5">
            {node.category}
          </span>
          <span className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-3 py-1.5">
            {node.estimatedDuration}
          </span>
          <span className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-3 py-1.5 capitalize">
            {(node.status ?? "available").replace("-", " ")}
          </span>
        </div>
      )}

      {node && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onSelect(node.id)}
            className="btn-ghost !w-auto !min-h-[44px] px-4"
          >
            View Node
          </button>
          <button
            type="button"
            onClick={() => onOpen(node)}
            disabled={!canOpen}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[14px] bg-[var(--primary)] px-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {hasLink ? "Open Lesson" : "Mark In Progress"}
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </Card>
  );
}
