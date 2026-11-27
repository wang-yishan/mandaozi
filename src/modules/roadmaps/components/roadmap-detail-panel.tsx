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
import {
  type TouchEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { listAssessmentAttemptsAction } from "@/app/actions/assessments";
import { Card } from "@/components/ui/card";
import type { RoadmapNodeVM } from "../types/roadmap";
import { RoadmapNodeChoicePicker } from "./roadmap-node-choice-picker";

interface Props {
  node: RoadmapNodeVM | null;
  selectedChoiceId?: string | null;
  onChoiceChange?: (nodeId: string, choiceId: string | null) => void;
  onClose: () => void;
  onOpen: (node: RoadmapNodeVM) => void;
  onComplete?: (node: RoadmapNodeVM) => void;
}

const STATUS_LABEL: Record<RoadmapNodeVM["status"], string> = {
  completed: "Completed",
  "in-progress": "In Progress",
  available: "Available",
  locked: "Locked",
  recommended: "Recommended",
  mastered: "Mastered",
  review_required: "Learning",
};

export function RoadmapDetailPanel({
  node,
  selectedChoiceId = null,
  onChoiceChange,
  onClose,
  onOpen,
  onComplete,
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

  const [attempts, setAttempts] = useState<
    Array<{
      id: string;
      status: string;
      score: number | null;
      maxScore: number | null;
      passed: boolean | null;
    }>
  >([]);
  const [dragY, setDragY] = useState(0);
  const draggingRef = useRef(false);
  const startYRef = useRef(0);

  useEffect(() => {
    if (!node) setDragY(0);
  }, [node]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    draggingRef.current = true;
    startYRef.current = t.clientY;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!draggingRef.current) return;
    const t = e.touches[0];
    if (!t) return;
    const delta = Math.max(0, t.clientY - startYRef.current);
    setDragY(delta);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragY((current) => {
      if (current > 120) {
        onClose();
        return 0;
      }
      return 0;
    });
  }, [onClose]);

  useEffect(() => {
    if (!node) {
      setAttempts([]);
      return;
    }
    let cancelled = false;
    void listAssessmentAttemptsAction({ nodeId: node.id, limit: 5 })
      .then((res) => {
        if (!cancelled)
          setAttempts(
            (res.attempts ?? []).map((a) => ({
              id: a.id,
              status: a.status,
              score: a.score ?? null,
              maxScore: a.maxScore ?? null,
              passed: a.passed ?? null,
            })),
          );
      })
      .catch(() => {
        if (!cancelled) setAttempts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [node]);

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
        className="max-h-[85dvh] w-full overflow-y-auto overscroll-contain rounded-t-3xl rounded-b-none border-x-0 border-b-0 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:max-w-[680px] sm:rounded-2xl sm:border sm:pb-5"
        style={{
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: draggingRef.current ? "none" : "transform 180ms ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="mx-auto mb-4 flex w-full justify-center pt-1 pb-2 sm:hidden touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          aria-hidden
        >
          <div className="h-1.5 w-12 rounded-full bg-[var(--line)]" />
        </div>
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

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4">
            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
              Competency / Mastery
            </div>
            {node.masteryState || node.competencies?.length ? (
              <div className="mt-2 space-y-2">
                {node.masteryState ? (
                  <div className="text-sm font-bold text-[var(--ink)]">
                    State: {node.masteryState.replace("_", " ")}
                  </div>
                ) : null}
                {(node.competencies ?? []).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="text-[var(--ink)]">{c.title}</span>
                    <span className="text-xs font-bold text-[var(--muted)]">
                      {c.state ? c.state.replace("_", " ") : "not started"}
                      {typeof c.score === "number"
                        ? ` · ${Math.round(c.score)}%`
                        : ""}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-[var(--muted)]">
                Competency mapping belum tersedia untuk node ini. Akan terisi
                saat data competency/mastery dihubungkan.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4">
            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
              Assessment
            </div>
            {node.assessments?.length ? (
              <div className="mt-2 space-y-2">
                {node.assessments.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="text-[var(--ink)]">{a.title}</span>
                    <span className="text-xs font-bold text-[var(--muted)]">
                      {a.passed === true
                        ? "Passed"
                        : a.passed === false
                          ? "Not passed"
                          : "Not attempted"}
                      {typeof a.lastScore === "number"
                        ? ` · ${a.lastScore}/${a.maxScore ?? 100}`
                        : ""}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-[var(--muted)]">
                Belum ada assessment terhubung. Assessment pass/fail akan
                menjadi evidence mastery, bukan sekadar completion lesson.
              </p>
            )}
            {attempts.length > 0 ? (
              <div className="mt-3 border-t border-[var(--line)] pt-3">
                <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                  Recent attempts
                </div>
                <div className="mt-2 space-y-1.5">
                  {attempts.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-[var(--ink)]">{a.status}</span>
                      <span className="font-bold text-[var(--muted)]">
                        {a.passed === true
                          ? "Passed"
                          : a.passed === false
                            ? "Failed"
                            : "—"}
                        {typeof a.score === "number"
                          ? ` · ${a.score}/${a.maxScore ?? 100}`
                          : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
            Learning Resources
          </div>
          {node.resources?.length ? (
            <div className="mt-2 space-y-2">
              {node.resources.map((r) => (
                <div
                  key={`${r.id}-${r.role}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-[var(--ink)] truncate">
                      {r.title}
                    </div>
                    <div className="text-xs text-[var(--muted)]">
                      {r.role} · {r.kind}
                    </div>
                  </div>
                  {r.href ? (
                    <a
                      href={r.href}
                      className="text-xs font-bold text-[var(--primary)] shrink-0"
                    >
                      Open
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-[var(--muted)]">
              {node.lessonInfo
                ? `Legacy resource: ${node.lessonInfo.label} (${node.lessonInfo.kind}${node.lessonInfo.href ? ", linked" : ""}).`
                : "Belum ada learning resource terhubung."}
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => onOpen(node)}
            disabled={!canOpen}
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[14px] bg-[var(--primary)] px-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {canOpen ? (
              <>
                <BookOpen size={16} />
                {hasLink ? "Open Assignment / Lesson" : "Mark In Progress"}
                <ArrowUpRight size={16} />
              </>
            ) : (
              <>
                <Lock size={16} /> Locked by prerequisites
              </>
            )}
          </button>
          {canOpen && onComplete ? (
            <button
              type="button"
              onClick={() => onComplete(node)}
              disabled={
                node.status === "completed" || node.status === "mastered"
              }
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-4 font-bold text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle2 size={16} />
              {node.status === "completed" || node.status === "mastered"
                ? "Completed"
                : "Mark Done"}
            </button>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
