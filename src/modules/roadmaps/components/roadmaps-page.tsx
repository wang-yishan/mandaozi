"use client";

import { Map as MapIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { PageSubnav } from "@/components/layout/page-subnav";
import { Card } from "@/components/ui/card";
import { useRoadmapProgress } from "../hooks/use-roadmap-progress";
import type { RoadmapDef, RoadmapNodeVM } from "../types/roadmap";
import { RoadmapDetailPanel } from "./roadmap-detail-panel";
import { RoadmapLegend } from "./roadmap-legend";
import { RoadmapProgressOverview } from "./roadmap-progress-overview";
import { RoadmapRecommendedNext } from "./roadmap-recommended-next";

const RoadmapCanvas = dynamic(
  () => import("./roadmap-canvas").then((m) => m.RoadmapCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="h-[560px] w-full animate-pulse rounded-2xl border border-[var(--line)] bg-[var(--surface)] sm:h-[640px]" />
    ),
  },
);

export function RoadmapsPage({
  roadmaps,
  defaultRoadmapId,
}: {
  roadmaps: RoadmapDef[];
  defaultRoadmapId: string;
}) {
  const router = useRouter();
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(defaultRoadmapId);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const roadmap = useMemo(
    () => roadmaps.find((r) => r.id === selectedRoadmapId) ?? roadmaps[0],
    [roadmaps, selectedRoadmapId],
  );

  const { nodes, completion, currentStage, nextNode, setRoadmapInProgress } =
    useRoadmapProgress(roadmap);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  const handleOpenNode = useCallback(
    (node: RoadmapNodeVM) => {
      if (node.status === "locked") return;
      const href = node.lessonInfo?.href;
      if (!href) {
        setRoadmapInProgress(roadmap.id, node.id);
        setSelectedNodeId(node.id);
        return;
      }
      setRoadmapInProgress(roadmap.id, node.id);
      router.push(href);
    },
    [roadmap.id, router, setRoadmapInProgress],
  );

  const handleSelectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  return (
    <section className="mx-auto max-w-[1200px] space-y-4">
      <div className="space-y-3">
        <div>
          <p className="text-sm font-bold text-[var(--muted)]">
            Learning Journey
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-[28px] font-black leading-tight">
            <MapIcon size={28} className="text-[var(--primary)]" />
            Roadmaps
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            Your journey to mastering Mandarin starts here.
          </p>
        </div>
        <PageSubnav />
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">
              Roadmap selector
            </div>
            <div className="mt-1 text-sm font-bold text-[var(--ink)]">
              {roadmap.title}
            </div>
          </div>
          <label className="block">
            <span className="sr-only">Select roadmap</span>
            <select
              value={selectedRoadmapId}
              onChange={(e) => {
                setSelectedRoadmapId(e.target.value);
                setSelectedNodeId(null);
              }}
              className="min-h-[44px] w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm font-bold text-[var(--ink)] sm:w-[320px]"
            >
              {roadmaps.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {roadmap.description}
        </p>
      </Card>

      <RoadmapProgressOverview
        completion={completion}
        currentStage={currentStage}
        nextNode={nextNode}
      />

      <div className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-black">Interactive Roadmap</h2>
            <p className="text-sm text-[var(--muted)]">
              Zoom, pan, and tap nodes to explore your learning path.
            </p>
          </div>
          <RoadmapLegend />
        </div>

        <RoadmapCanvas
          nodes={nodes}
          edges={roadmap.edges}
          selectedNodeId={selectedNodeId}
          onSelectNode={handleSelectNode}
        />

        <RoadmapRecommendedNext
          node={nextNode}
          onSelect={(id) => setSelectedNodeId(id)}
          onOpen={handleOpenNode}
        />

        <RoadmapDetailPanel
          node={selectedNode}
          onClose={() => setSelectedNodeId(null)}
          onOpen={handleOpenNode}
        />
      </div>
    </section>
  );
}
