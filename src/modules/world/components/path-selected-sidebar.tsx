"use client";

import { ArrowRight, BookOpenCheck, CheckCircle2, Route } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { RoadmapPathSelectButton } from "@/modules/roadmaps/components/roadmap-path-select-button";
import type { RoadmapDef } from "@/modules/roadmaps/types/roadmap";
import { getRoadmapCompletion } from "@/modules/roadmaps/utils/roadmap-progress";
import { buildRoadmapNodeVMsWithProgression } from "@/modules/roadmaps/utils/roadmap-progression-adapter";
import { useMadaraStore } from "@/store/madara-store";

interface Props {
  roadmaps: RoadmapDef[];
}

export function PathSelectedSidebar({ roadmaps }: Props) {
  const selectedPathRoadmapId = useMadaraStore((s) => s.selectedPathRoadmapId);
  const roadmapProgressById = useMadaraStore((s) => s.roadmapProgressById);
  const roadmapChoiceById = useMadaraStore((s) => s.roadmapChoiceById);

  const activeRoadmap =
    roadmaps.find((r) => r.id === selectedPathRoadmapId) ?? null;

  const progress = activeRoadmap
    ? roadmapProgressById[activeRoadmap.id]
    : undefined;
  const completion = activeRoadmap
    ? getRoadmapCompletion(activeRoadmap, progress)
    : null;
  const nodes = activeRoadmap
    ? buildRoadmapNodeVMsWithProgression(activeRoadmap, progress, {
        branchChoices: roadmapChoiceById[activeRoadmap.id] ?? {},
      })
    : [];
  const nextNode =
    nodes.find(
      (n) =>
        n.status === "recommended" ||
        n.status === "in-progress" ||
        n.status === "review_required",
    ) ?? null;

  return (
    <aside className="space-y-3" aria-labelledby="path-selected-title">
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
            <Route size={18} />
          </div>
          <div>
            <h2
              id="path-selected-title"
              className="text-base font-black leading-tight"
            >
              Path Selected
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Roadmap yang sedang kamu jalani
            </p>
          </div>
        </div>

        {!activeRoadmap ? (
          <div className="mt-4 rounded-xl border border-dashed border-[var(--line)] bg-[var(--bg)] p-4">
            <p className="text-sm font-bold text-[var(--ink)]">
              Belum ada path dipilih
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Pilih satu roadmap untuk dijalani. Progress dan silabusnya akan
              tampil di sini.
            </p>
            <Link
              href="/roadmaps"
              className="btn-primary mt-3 !min-h-[40px] !w-auto px-4 text-sm inline-flex items-center gap-2"
            >
              Pilih roadmap <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-sm font-black text-[var(--ink)]">
                  {activeRoadmap.title}
                </div>
                {completion?.isCompleted && (
                  <span className="rounded-full bg-[var(--primary-soft)] px-2 py-0.5 text-[11px] font-black text-[var(--primary)]">
                    Completed
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-[var(--muted)] line-clamp-2">
                {activeRoadmap.description}
              </p>
            </div>

            {completion && (
              <div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[var(--muted)]">Progress</span>
                  <span className="text-[var(--primary)]">
                    {completion.percentage}%
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--line)]">
                  <div
                    className="h-full rounded-full bg-[var(--primary)]"
                    style={{ width: `${completion.percentage}%` }}
                  />
                </div>
                <div className="mt-1 text-xs text-[var(--muted)]">
                  {completion.completed}/{completion.total} topik selesai
                </div>
              </div>
            )}

            {completion?.isCompleted ? (
              <div className="rounded-xl bg-[var(--primary-soft)] p-3 text-sm font-bold text-[var(--primary)]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  Perjalanan dao selesai
                </div>
                <p className="mt-1 text-xs font-medium text-[var(--muted)]">
                  Roadmap ini telah dikuasai. Kamu tetap bisa membukanya atau
                  ganti path.
                </p>
              </div>
            ) : nextNode ? (
              <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3">
                <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                  Next di path
                </div>
                <div className="mt-1 text-sm font-bold text-[var(--ink)]">
                  {nextNode.title}
                </div>
                <div className="text-xs text-[var(--muted)]">
                  {nextNode.estimatedDuration}
                </div>
              </div>
            ) : null}

            <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                <BookOpenCheck size={13} /> Silabus
              </div>
              {activeRoadmap.silabus ? (
                <p className="mt-1 text-xs text-[var(--muted)] line-clamp-3">
                  {activeRoadmap.silabus.overview ??
                    `${activeRoadmap.silabus.objectives.length} tujuan, ${activeRoadmap.silabus.sections.length} bagian materi.`}
                </p>
              ) : (
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Silabus placeholder — data akan ditambahkan per roadmap.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <RoadmapPathSelectButton
                roadmap={activeRoadmap}
                size="sm"
                className="w-full"
              />
              <Link
                href="/roadmaps"
                className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-3 text-sm font-bold text-[var(--ink)]"
              >
                Buka roadmap <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        )}
      </Card>
    </aside>
  );
}
