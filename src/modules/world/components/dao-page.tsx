"use client";

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  Lock,
  PlayCircle,
  Route,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { PageSubnav } from "@/components/layout/page-subnav";
import { Card } from "@/components/ui/card";
import type {
  RoadmapDef,
  RoadmapNodeVM,
} from "@/modules/roadmaps/types/roadmap";
import {
  applyNodeVariant,
  buildDaoRoadmap,
  getSelectedChoice,
} from "@/modules/roadmaps/utils/roadmap-choices";
import {
  buildRoadmapNodeVMs,
  getNextRecommendedNode,
  getRoadmapCompletion,
  normalizeRoadmapProgress,
} from "@/modules/roadmaps/utils/roadmap-progress";
import { useMadaraStore } from "@/store/madara-store";

interface Props {
  roadmaps: RoadmapDef[];
}

function statusLabel(status: RoadmapNodeVM["status"]): string {
  switch (status) {
    case "completed":
      return "Selesai";
    case "in-progress":
      return "Sedang dipelajari";
    case "recommended":
      return "Next";
    case "available":
      return "Siap dipelajari";
    case "locked":
      return "Terkunci";
    default:
      return status;
  }
}

function StatusIcon({ status }: { status: RoadmapNodeVM["status"] }) {
  if (status === "completed") {
    return <CheckCircle2 size={18} className="text-[var(--primary)]" />;
  }
  if (status === "locked") {
    return <Lock size={18} className="text-[var(--muted)]" />;
  }
  if (status === "in-progress" || status === "recommended") {
    return (
      <PlayCircle size={18} className="text-[var(--vermillion,#e45e4f)]" />
    );
  }
  return <Circle size={18} className="text-[var(--muted)]" />;
}

export function DaoPage({ roadmaps }: Props) {
  const router = useRouter();
  const selectedPathRoadmapId = useMadaraStore((s) => s.selectedPathRoadmapId);
  const roadmapProgressById = useMadaraStore((s) => s.roadmapProgressById);
  const roadmapChoiceById = useMadaraStore((s) => s.roadmapChoiceById);
  const setRoadmapInProgress = useMadaraStore((s) => s.setRoadmapInProgress);

  const roadmap = useMemo(
    () => roadmaps.find((r) => r.id === selectedPathRoadmapId) ?? null,
    [roadmaps, selectedPathRoadmapId],
  );

  const choiceSelection = useMemo(
    () => (roadmap ? (roadmapChoiceById[roadmap.id] ?? {}) : {}),
    [roadmap, roadmapChoiceById],
  );

  const progress = useMemo(
    () =>
      normalizeRoadmapProgress(
        roadmap ? roadmapProgressById[roadmap.id] : undefined,
      ),
    [roadmap, roadmapProgressById],
  );

  // Pengkondisian arah pembelajaran HANYA di Dao.
  const daoRoadmap = useMemo(
    () => (roadmap ? buildDaoRoadmap(roadmap, choiceSelection) : null),
    [roadmap, choiceSelection],
  );

  const daoRoadmapWithVariants = useMemo(() => {
    if (!daoRoadmap) return null;
    return {
      ...daoRoadmap,
      nodes: daoRoadmap.nodes.map((node) =>
        applyNodeVariant(node, choiceSelection),
      ),
    };
  }, [daoRoadmap, choiceSelection]);

  const nodes = useMemo(
    () =>
      daoRoadmapWithVariants
        ? buildRoadmapNodeVMs(daoRoadmapWithVariants, progress)
        : [],
    [daoRoadmapWithVariants, progress],
  );

  const completion = useMemo(
    () =>
      daoRoadmapWithVariants
        ? getRoadmapCompletion(daoRoadmapWithVariants, progress)
        : null,
    [daoRoadmapWithVariants, progress],
  );

  const nextNode = useMemo(
    () =>
      daoRoadmapWithVariants
        ? getNextRecommendedNode(daoRoadmapWithVariants, progress)
        : null,
    [daoRoadmapWithVariants, progress],
  );

  const handleOpenNode = useCallback(
    (node: RoadmapNodeVM) => {
      if (!roadmap || node.status === "locked") return;
      const href = node.lessonInfo?.href;
      setRoadmapInProgress(roadmap.id, node.id);
      if (href) router.push(href);
    },
    [roadmap, router, setRoadmapInProgress],
  );

  const completedNodes = nodes.filter((n) => n.status === "completed");
  const todoNodes = nodes.filter((n) => n.status !== "completed");

  return (
    <section className="mx-auto max-w-[980px] space-y-4">
      <div className="space-y-3">
        <div>
          <p className="text-sm font-bold text-[var(--muted)]">World · Dao</p>
          <h1 className="mt-1 flex items-center gap-2 text-[28px] font-black leading-tight">
            <Route size={28} className="text-[var(--primary)]" />
            Dao
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            Jejeran arah pembelajaran 1-per-1 dari roadmap yang kamu jalani.
            Lebih simpel, langsung ter-track.
          </p>
        </div>
        <PageSubnav />
      </div>

      {!roadmap ? (
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
              <Route size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-base font-black text-[var(--ink)]">
                Belum ada path dipilih
              </div>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Pilih satu roadmap untuk dijalani. Dao akan menampilkan current
                roadmap dan jejeran topik yang sudah selesai serta yang harus
                diselesaikan.
              </p>
              <Link
                href="/roadmaps"
                className="btn-primary mt-4 !min-h-[44px] !w-auto px-4 text-sm inline-flex items-center gap-2"
              >
                Pilih roadmap <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <Card className="p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">
                    Current roadmap
                  </div>
                  {completion?.isCompleted && (
                    <span className="rounded-full bg-[var(--primary-soft)] px-2 py-0.5 text-[11px] font-black text-[var(--primary)]">
                      Completed
                    </span>
                  )}
                </div>
                <h2 className="mt-1 text-xl font-black text-[var(--ink)]">
                  {roadmap.title}
                </h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {roadmap.description}
                </p>
              </div>
              <Link
                href="/roadmaps"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-bold text-[var(--ink)] shrink-0"
              >
                Ganti path <ArrowRight size={15} />
              </Link>
            </div>

            {completion && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-[var(--muted)]">Progress</span>
                  <span className="text-[var(--primary)]">
                    {completion.completed}/{completion.total} ·{" "}
                    {completion.percentage}%
                  </span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--line)]">
                  <div
                    className="h-full rounded-full bg-[var(--primary)] transition-[width]"
                    style={{ width: `${completion.percentage}%` }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
                  <span>
                    <span className="font-bold text-[var(--ink)]">
                      {completedNodes.length}
                    </span>{" "}
                    sudah selesai
                  </span>
                  <span>
                    <span className="font-bold text-[var(--ink)]">
                      {todoNodes.length}
                    </span>{" "}
                    harus diselesaikan
                  </span>
                </div>
                {completion.isCompleted && (
                  <p className="mt-3 text-sm font-bold text-[var(--primary)]">
                    Perjalanan dao selesai — roadmap ini telah dikuasai.
                  </p>
                )}
              </div>
            )}
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-[var(--ink)]">
                  Arah pembelajaran
                </h3>
                <p className="text-sm text-[var(--muted)]">
                  Ikuti urutan 1-per-1. Pengkondisian arah pembelajaran hanya
                  berlaku di Dao; diagram roadmap tetap utuh.
                </p>
              </div>
              {nextNode && (
                <div className="hidden sm:block text-right">
                  <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                    Next
                  </div>
                  <div className="text-sm font-bold text-[var(--ink)] max-w-[220px] truncate">
                    {nextNode.title}
                  </div>
                </div>
              )}
            </div>

            {nodes.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-[var(--line)] bg-[var(--bg)] p-4 text-sm text-[var(--muted)]">
                Tidak ada node pada jalur Dao ini. Atur pilihan Varian Node di{" "}
                <Link
                  href="/roadmaps"
                  className="font-bold text-[var(--primary)]"
                >
                  Roadmaps
                </Link>
                .
              </div>
            ) : (
              <ol className="mt-4 space-y-2">
                {nodes.map((node, index) => {
                  const done = node.status === "completed";
                  const isNext = nextNode?.id === node.id;
                  const canOpen = node.status !== "locked";
                  const hasHref = Boolean(node.lessonInfo?.href);
                  const originalNode = roadmap.nodes.find(
                    (n) => n.id === node.id,
                  );
                  const selectedChoice = originalNode
                    ? getSelectedChoice(originalNode, choiceSelection)
                    : null;

                  return (
                    <li key={node.id}>
                      <div
                        className={`flex items-start gap-3 rounded-xl border p-3 sm:p-4 ${
                          done
                            ? "border-[var(--line)] bg-[var(--bg)]"
                            : isNext
                              ? "border-[var(--primary)] bg-[var(--primary-soft)]/30"
                              : "border-[var(--line)] bg-[var(--surface)]"
                        }`}
                      >
                        <div className="flex shrink-0 items-center gap-2 pt-0.5">
                          <span className="w-6 text-center text-xs font-black text-[var(--muted)]">
                            {index + 1}
                          </span>
                          <StatusIcon status={node.status} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <div
                              className={`text-sm font-bold ${
                                done
                                  ? "text-[var(--muted)]"
                                  : "text-[var(--ink)]"
                              }`}
                            >
                              {node.title}
                            </div>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.04em] ${
                                done
                                  ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                                  : isNext
                                    ? "bg-[var(--vermillion,#e45e4f)]/15 text-[var(--vermillion,#e45e4f)]"
                                    : "bg-[var(--line)]/60 text-[var(--muted)]"
                              }`}
                            >
                              {isNext && !done
                                ? "Next"
                                : statusLabel(node.status)}
                            </span>
                            {selectedChoice ? (
                              <span className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-2 py-0.5 text-[10px] font-bold text-[var(--muted)]">
                                Varian: {selectedChoice.label}
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-0.5 text-xs text-[var(--muted)]">
                            {node.estimatedDuration}
                            {node.lessonInfo
                              ? ` · ${node.lessonInfo.label}`
                              : ""}
                          </div>
                        </div>

                        <div className="shrink-0">
                          {canOpen ? (
                            <button
                              type="button"
                              onClick={() => handleOpenNode(node)}
                              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 text-xs font-bold text-[var(--ink)] hover:bg-[var(--bg)]"
                            >
                              <BookOpen size={14} />
                              {hasHref ? (done ? "Review" : "Buka") : "Tandai"}
                            </button>
                          ) : (
                            <span className="inline-flex min-h-[36px] items-center px-2 text-xs font-bold text-[var(--muted)]">
                              Terkunci
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </Card>
        </>
      )}
    </section>
  );
}
