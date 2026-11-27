"use client";

import {
  Check,
  ChevronRight,
  Lock,
  MapPin,
  PlayCircle,
  RotateCcw,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { RoadmapPreviewNode } from "../../types/dashboard";

interface RoadmapPreviewProps {
  title: string;
  summary: string;
  nodes: RoadmapPreviewNode[];
  fullRoadmapHref: string;
}

function StatusIcon({ status }: { status: RoadmapPreviewNode["status"] }) {
  if (status === "mastered") {
    return (
      <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--success-bg)] text-[var(--success)] ring-1 ring-[color:color-mix(in_srgb,var(--success)_20%,transparent)]">
        <Trophy size={16} strokeWidth={2.5} />
      </span>
    );
  }
  if (status === "completed") {
    return (
      <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--success-bg)] text-[var(--success)] ring-1 ring-[color:color-mix(in_srgb,var(--success)_20%,transparent)]">
        <Check size={16} strokeWidth={2.5} />
      </span>
    );
  }
  if (status === "review_required") {
    return (
      <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--warning-bg,#fff7ed)] text-[var(--warning,#b45309)] ring-1 ring-[color:color-mix(in_srgb,var(--warning,#b45309)_20%,transparent)]">
        <RotateCcw size={16} />
      </span>
    );
  }
  if (
    status === "current" ||
    status === "in-progress" ||
    status === "recommended"
  ) {
    return (
      <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)] ring-4 ring-[color:color-mix(in_srgb,var(--primary)_12%,transparent)]">
        {status === "in-progress" || status === "recommended" ? (
          <PlayCircle size={16} />
        ) : (
          <MapPin size={16} />
        )}
      </span>
    );
  }
  if (status === "locked") {
    return (
      <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--bg)] text-[var(--muted)] ring-1 ring-[var(--line)]">
        <Lock size={16} />
      </span>
    );
  }
  return (
    <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--surface)] text-[var(--muted)] ring-1 ring-[var(--line)]">
      <span className="h-2.5 w-2.5 rounded-full bg-[var(--muted)]" />
    </span>
  );
}

function statusLabel(status: RoadmapPreviewNode["status"]): string {
  if (status === "mastered") return "Mastered";
  if (status === "completed") return "Completed";
  if (status === "review_required") return "Review required";
  if (status === "in-progress") return "In progress";
  if (status === "recommended") return "Recommended next";
  if (status === "current") return "Current stage";
  if (status === "available") return "Available next";
  return "Locked";
}

export function RoadmapPreview({
  title,
  summary,
  nodes,
  fullRoadmapHref,
}: RoadmapPreviewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    nodes.find((n) => n.status === "current")?.id ?? nodes[0]?.id ?? null,
  );
  const selected = nodes.find((n) => n.id === selectedId) ?? null;

  return (
    <section
      aria-labelledby="roadmap-preview-title"
      className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)]">
            Learning journey
          </p>
          <h2
            id="roadmap-preview-title"
            className="mt-1 text-xl font-black text-[var(--ink)]"
          >
            {title}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{summary}</p>
        </div>
        <Link
          href={fullRoadmapHref}
          className="inline-flex min-h-[44px] items-center gap-1 rounded-full px-3 text-sm font-bold text-[var(--primary)] transition hover:bg-[var(--primary-soft)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
        >
          View Full Roadmap
          <ChevronRight size={16} />
        </Link>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <ol className="space-y-0" aria-label="Roadmap stages">
          {nodes.map((node, index) => {
            const selectedNode = node.id === selectedId;
            const isLast = index === nodes.length - 1;
            return (
              <li key={node.id} className="relative flex gap-3 pb-4 last:pb-0">
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[18px] top-10 h-[calc(100%-18px)] w-px bg-[var(--line)]"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setSelectedId(node.id)}
                  className="relative z-[1] mt-0.5 shrink-0 rounded-full focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
                  aria-label={`${node.title}, ${statusLabel(node.status)}${node.progressPercent !== undefined ? `, ${node.progressPercent}%` : ""}`}
                  aria-pressed={selectedNode}
                >
                  <StatusIcon status={node.status} />
                </button>
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => setSelectedId(node.id)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] ${
                      selectedNode
                        ? "border-[color:color-mix(in_srgb,var(--primary)_28%,var(--line))] bg-[var(--primary-soft)]"
                        : "border-transparent bg-transparent hover:border-[var(--line)] hover:bg-[var(--bg)]"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-[var(--ink)]">
                        {node.title}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          node.status === "completed"
                            ? "bg-[var(--success-bg)] text-[var(--success)]"
                            : node.status === "current"
                              ? "bg-[color:color-mix(in_srgb,var(--primary)_14%,var(--surface))] text-[var(--primary)]"
                              : node.status === "locked"
                                ? "bg-[var(--bg)] text-[var(--muted)]"
                                : "bg-[var(--bg)] text-[var(--muted)]"
                        }`}
                      >
                        {statusLabel(node.status)}
                      </span>
                    </div>
                    {node.progressPercent !== undefined && (
                      <div className="mt-3 space-y-1.5">
                        <div className="flex justify-between text-[11px] font-bold text-[var(--muted)]">
                          <span>Progress</span>
                          <span>{node.progressPercent}%</span>
                        </div>
                        <ProgressBar
                          value={node.progressPercent}
                          label={`${node.title} progress`}
                          className="h-2"
                          indicatorClassName={
                            node.status === "completed"
                              ? "bg-[var(--success)]"
                              : "bg-[linear-gradient(90deg,var(--primary),var(--accent))]"
                          }
                        />
                      </div>
                    )}
                  </button>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4">
          {selected ? (
            <div className="space-y-3">
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[var(--muted)]">
                Stage details
              </p>
              <h3 className="text-lg font-black text-[var(--ink)]">
                {selected.title}
              </h3>
              <p className="text-sm text-[var(--muted)]">
                {selected.status === "locked"
                  ? (selected.prerequisiteLabel ?? "This stage is locked.")
                  : selected.status === "completed"
                    ? "You’ve completed this stage. You can revisit it anytime from the full roadmap."
                    : selected.status === "current"
                      ? "You are here. Keep going to unlock the next stage."
                      : "This stage is available. Complete current prerequisites to make it your active path."}
              </p>
              {selected.status !== "locked" ? (
                <Link
                  href={selected.href ?? fullRoadmapHref}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--surface)] px-4 text-sm font-bold text-[var(--primary)] border border-[var(--line)] hover:bg-[var(--primary-soft)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
                >
                  Open stage
                  <ChevronRight size={16} />
                </Link>
              ) : (
                <div className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-bold text-[var(--muted)]">
                  <Lock size={15} />
                  Prerequisite required
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">
              Select a stage to see details.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
