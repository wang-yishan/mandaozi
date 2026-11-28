"use client";

import { Map as MapIcon } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { completeMasteryCardAction } from "@/app/actions/mastery";
import { listUserRoadmapRecordsAction } from "@/app/actions/roadmap";
import { PageSubnav } from "@/components/layout/page-subnav";
import { Card } from "@/components/ui/card";
import { useMadaraStore } from "@/store/madara-store";
import { useRoadmapProgress } from "../hooks/use-roadmap-progress";
import type { RoadmapDef, RoadmapNodeVM } from "../types/roadmap";
import { getRoadmapCompletion } from "../utils/roadmap-progress";
import { RoadmapDetailPanel } from "./roadmap-detail-panel";
import { RoadmapLegend } from "./roadmap-legend";
import { RoadmapPathSelectButton } from "./roadmap-path-select-button";
import { RoadmapProgressOverview } from "./roadmap-progress-overview";
import { RoadmapRecommendedNext } from "./roadmap-recommended-next";
import { RoadmapSilabus } from "./roadmap-silabus";

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
  const [completedRecords, setCompletedRecords] = useState<
    Array<{ roadmapId: string; completedAt: Date | null }>
  >([]);

  useEffect(() => {
    let cancelled = false;
    void listUserRoadmapRecordsAction()
      .then((res) => {
        if (cancelled) return;
        setCompletedRecords(
          (res.completed ?? []).map((r) => ({
            roadmapId: r.roadmapId,
            completedAt: r.completedAt ? new Date(r.completedAt) : null,
          })),
        );
      })
      .catch(() => {
        if (!cancelled) setCompletedRecords([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  const roadmapProgressById = useMadaraStore((s) => s.roadmapProgressById);
  const selectedPathRoadmapId = useMadaraStore((s) => s.selectedPathRoadmapId);
  const roadmapChoiceById = useMadaraStore((s) => s.roadmapChoiceById);
  const setRoadmapNodeChoice = useMadaraStore((s) => s.setRoadmapNodeChoice);
  const completeRoadmapNode = useMadaraStore((s) => s.completeRoadmapNode);

  const choiceSelection = useMemo(
    () => roadmapChoiceById[roadmap.id] ?? {},
    [roadmap.id, roadmapChoiceById],
  );

  const handleChoiceChange = useCallback(
    (nodeId: string, choiceId: string | null) => {
      setRoadmapNodeChoice(roadmap.id, nodeId, choiceId);
    },
    [roadmap.id, setRoadmapNodeChoice],
  );

  const handleOpenNode = useCallback(
    (node: RoadmapNodeVM) => {
      if (node.status === "locked") return;
      setRoadmapInProgress(roadmap.id, node.id);
      router.push(node.masteryHref);
    },
    [roadmap.id, router, setRoadmapInProgress],
  );

  const handleCompleteNode = useCallback(
    (node: RoadmapNodeVM) => {
      if (node.status === "locked") return;
      void completeMasteryCardAction({
        learningItemId: node.learningItemId,
        roadmapId: roadmap.id,
        nodeId: node.id,
      })
        .then((res) => {
          if (res.nodeCompleted) completeRoadmapNode(roadmap.id, node.id);
        })
        .catch((e) => console.error("complete node failed", e));
    },
    [completeRoadmapNode, roadmap.id],
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
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">
                Roadmap selector
              </div>
              {completion.isCompleted && (
                <span className="rounded-full bg-[var(--primary-soft)] px-2 py-0.5 text-[11px] font-black text-[var(--primary)]">
                  Completed
                </span>
              )}
              {selectedPathRoadmapId === roadmap.id && (
                <span className="rounded-full border border-[var(--primary)] px-2 py-0.5 text-[11px] font-black text-[var(--primary)]">
                  Path aktif
                </span>
              )}
            </div>
            <div className="mt-1 text-sm font-bold text-[var(--ink)]">
              {roadmap.title}
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <label className="block w-full sm:w-[320px]">
              <span className="sr-only">Select roadmap</span>
              <select
                value={selectedRoadmapId}
                onChange={(e) => {
                  setSelectedRoadmapId(e.target.value);
                  setSelectedNodeId(null);
                }}
                className="min-h-[44px] w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-sm font-bold text-[var(--ink)]"
              >
                {roadmaps.map((item) => {
                  const itemCompletion = getRoadmapCompletion(
                    item,
                    roadmapProgressById[item.id],
                  );
                  const isPath = selectedPathRoadmapId === item.id;
                  const suffix = [
                    itemCompletion.isCompleted ? "selesai" : null,
                    isPath ? "path aktif" : null,
                  ]
                    .filter(Boolean)
                    .join(", ");
                  return (
                    <option key={item.id} value={item.id}>
                      {suffix ? `${item.title} (${suffix})` : item.title}
                    </option>
                  );
                })}
              </select>
            </label>
            <RoadmapPathSelectButton roadmap={roadmap} className="sm:w-auto" />
          </div>
        </div>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {roadmap.description}
        </p>
        {completion.isCompleted && (
          <p className="mt-2 text-sm font-bold text-[var(--primary)]">
            Perjalanan dao selesai — roadmap ini telah dikuasai.
          </p>
        )}
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
          choiceSelection={choiceSelection}
          onChoiceChange={handleChoiceChange}
        />

        <RoadmapRecommendedNext
          node={nextNode}
          onSelect={(id) => setSelectedNodeId(id)}
          onOpen={handleOpenNode}
        />

        <RoadmapDetailPanel
          node={selectedNode}
          selectedChoiceId={
            selectedNode ? (choiceSelection[selectedNode.id] ?? null) : null
          }
          onChoiceChange={handleChoiceChange}
          onClose={() => setSelectedNodeId(null)}
          onOpen={handleOpenNode}
          onComplete={handleCompleteNode}
        />
      </div>

      <RoadmapSilabus roadmap={roadmap} />

      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-[var(--ink)]">
              Completed roadmaps
            </h3>
            <p className="text-sm text-[var(--muted)]">
              Riwayat roadmap yang sudah diselesaikan.
            </p>
          </div>
          <span className="rounded-full bg-[var(--primary-soft)] px-2 py-0.5 text-[11px] font-black text-[var(--primary)]">
            {completedRecords.length}
          </span>
        </div>
        {completedRecords.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--muted)]">
            Belum ada roadmap selesai.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {completedRecords.map((r) => {
              const rm = roadmaps.find((x) => x.id === r.roadmapId);
              return (
                <li
                  key={r.roadmapId}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[var(--ink)] truncate">
                      {rm?.title ?? r.roadmapId}
                    </div>
                    <div className="text-xs text-[var(--muted)]">
                      {r.completedAt
                        ? `Completed ${r.completedAt.toLocaleDateString()}`
                        : "Completed"}
                    </div>
                  </div>
                  <Link
                    href="/roadmaps"
                    className="text-xs font-bold text-[var(--primary)] shrink-0"
                  >
                    Open
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </section>
  );
}
