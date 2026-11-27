"use client";

import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Lock,
  Route,
  X,
} from "lucide-react";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import type { RoadmapNodeVM } from "../types/roadmap";
import { RoadmapNodeChoicePicker } from "./roadmap-node-choice-picker";

interface Props {
  node: RoadmapNodeVM | null;
  selectedChoiceId?: string | null;
  onChoiceChange?: (nodeId: string, choiceId: string | null) => void;
  onClose: () => void;
  onOpen: (node: RoadmapNodeVM) => void;
}

const STATUS_LABEL: Record<RoadmapNodeVM["status"], string> = {
  completed: "Completed",
  "in-progress": "In Progress",
  available: "Available",
  locked: "Locked",
  recommended: "Recommended",
};

export function RoadmapDetailPanel({
  node,
  selectedChoiceId = null,
  onChoiceChange,
  onClose,
  onOpen,
}: Props) {
  useEffect(() => {
    if (!node) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [node, onClose]);

  if (!node) return null;

  const hasLink = Boolean(node.lessonInfo?.href);
  const canOpen = node.status !== "locked";

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop closes on click; Escape handled globally
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/35 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${node.title} details`}
      onClick={onClose}
    >
      <Card
        className="max-h-[85dvh] w-full overflow-y-auto rounded-t-3xl rounded-b-none border-x-0 border-b-0 p-5 sm:max-w-[680px] sm:rounded-2xl sm:border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">
              Node Details
            </div>
            <h3 className="mt-2 text-xl font-black leading-tight">
              {node.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--bg)] text-[var(--muted)]"
            aria-label="Close node details"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
            Description
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]">
            {node.description}
          </p>
        </div>

        <div className="mt-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
            Instruction
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            {node.status === "locked"
              ? "Complete the prerequisite topics first to unlock this node. Review the prerequisites below, then continue with the recommended available topic."
              : hasLink
                ? `Open this ${node.lessonInfo?.kind ?? "lesson"} to study "${node.lessonInfo?.label ?? node.title}". After finishing, return to the roadmap to continue with the next recommended topic.`
                : "This topic is ready in the roadmap but its lesson link has not been added yet. You can mark it in progress now, and add the route later in the roadmap data."}
          </p>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
              Category
            </div>
            <div className="mt-1 font-bold capitalize">{node.category}</div>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
              Status
            </div>
            <div className="mt-1 font-bold">{STATUS_LABEL[node.status]}</div>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
              Duration
            </div>
            <div className="mt-1 flex items-center gap-2 font-bold">
              <Clock3 size={14} className="text-[var(--muted)]" />
              {node.estimatedDuration}
            </div>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
              Lesson / Exercise
            </div>
            <div className="mt-1 font-bold">
              {node.lessonInfo
                ? `${node.lessonInfo.label} · ${node.lessonInfo.kind}`
                : "Not configured"}
            </div>
          </div>
        </div>

        {node.choices?.length ? (
          <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4">
            <RoadmapNodeChoicePicker
              node={node}
              selectedChoiceId={selectedChoiceId}
              onChange={(choiceId) => onChoiceChange?.(node.id, choiceId)}
            />
            {selectedChoiceId ? (
              <p className="mt-3 text-xs text-[var(--muted)]">
                Varian terpilih akan diterapkan pada tampilan{" "}
                <span className="font-bold text-[var(--ink)]">Dao</span>.
                Diagram roadmap tetap menampilkan semua node.
              </p>
            ) : (
              <p className="mt-3 text-xs text-[var(--muted)]">
                Pilih varian untuk mengkondisikan arah pembelajaran di{" "}
                <span className="font-bold text-[var(--ink)]">Dao</span>.
              </p>
            )}
          </div>
        ) : null}

        <div className="mt-4">
          <div className="flex items-center gap-2 text-sm font-black">
            <Route size={16} /> Prerequisites
          </div>
          {node.prerequisites.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--muted)]">
              No prerequisites. This is a starting point.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {node.prerequisites.map((prereq) => (
                <li
                  key={prereq.id}
                  className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm"
                >
                  {prereq.completed ? (
                    <CheckCircle2 size={16} className="text-[var(--success)]" />
                  ) : (
                    <Lock size={16} className="text-[var(--muted)]" />
                  )}
                  <span
                    className={
                      prereq.completed
                        ? "text-[var(--ink)]"
                        : "text-[var(--muted)]"
                    }
                  >
                    {prereq.title}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={() => onOpen(node)}
            disabled={!canOpen}
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[14px] bg-[var(--primary)] px-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {canOpen ? (
              <>
                <BookOpen size={16} />
                {hasLink ? "Open Lesson" : "Mark In Progress"}
                <ArrowUpRight size={16} />
              </>
            ) : (
              <>
                <Lock size={16} /> Locked by prerequisites
              </>
            )}
          </button>
        </div>
      </Card>
    </div>
  );
}
