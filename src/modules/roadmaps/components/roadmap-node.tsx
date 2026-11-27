"use client";

import { Handle, type Node, type NodeProps, Position } from "@xyflow/react";
import {
  BookOpen,
  CheckCircle2,
  CircleDashed,
  Lock,
  PlayCircle,
  Sparkles,
  Trophy,
} from "lucide-react";
import type { RoadmapNodeVM } from "../types/roadmap";
import { RoadmapNodeChoicePicker } from "./roadmap-node-choice-picker";

export type RoadmapNodeData = RoadmapNodeVM & {
  selectedNode: boolean;
  selectedChoiceId?: string | null;
  onChoiceChange?: (nodeId: string, choiceId: string | null) => void;
  [key: string]: unknown;
};

export type RoadmapFlowNode = Node<RoadmapNodeData, "roadmap">;

const STATUS_META = {
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className:
      "border-[color:color-mix(in_srgb,var(--success)_35%,var(--line))] bg-[var(--success-bg)]",
    badge: "bg-[var(--success-bg)] text-[var(--success)]",
  },
  "in-progress": {
    label: "In Progress",
    icon: PlayCircle,
    className:
      "border-[color:color-mix(in_srgb,var(--primary)_35%,var(--line))] bg-[var(--surface)]",
    badge: "bg-[var(--primary-soft)] text-[var(--primary)]",
  },
  available: {
    label: "Available",
    icon: BookOpen,
    className: "border-[var(--line)] bg-[var(--surface)]",
    badge: "bg-[var(--bg)] text-[var(--muted)]",
  },
  locked: {
    label: "Locked",
    icon: Lock,
    className:
      "border-[var(--line)] bg-[color:color-mix(in_srgb,var(--bg)_85%,var(--surface))] opacity-80",
    badge: "bg-[var(--bg)] text-[var(--muted)]",
  },
  recommended: {
    label: "Recommended",
    icon: Sparkles,
    className:
      "border-[color:color-mix(in_srgb,var(--primary)_45%,var(--line))] bg-[var(--surface)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--primary)_18%,transparent)]",
    badge: "bg-[var(--primary-soft)] text-[var(--primary)]",
  },
  mastered: {
    label: "Mastered",
    icon: Trophy,
    className:
      "border-[color:color-mix(in_srgb,var(--success)_45%,var(--line))] bg-[var(--success-bg)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--success)_18%,transparent)]",
    badge: "bg-[var(--success-bg)] text-[var(--success)]",
  },
  review_required: {
    label: "Learning",
    icon: PlayCircle,
    className:
      "border-[color:color-mix(in_srgb,var(--primary)_35%,var(--line))] bg-[var(--surface)]",
    badge: "bg-[var(--primary-soft)] text-[var(--primary)]",
  },
} as const;

export function RoadmapNode({ data }: NodeProps<RoadmapFlowNode>) {
  const meta = STATUS_META[data.status];
  const Icon = meta.icon;
  const selected = data.selectedNode;

  return (
    <div
      className={`w-[240px] rounded-2xl border p-4 text-left shadow-[var(--shadow-sm)] transition ${meta.className} ${
        selected
          ? "ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg)]"
          : ""
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-[var(--line)] !border-[var(--surface)]"
      />
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wide ${meta.badge}`}
        >
          <Icon size={12} />
          {meta.label}
        </span>
        {data.status === "in-progress" ? (
          <span
            className="mt-1 h-2.5 w-2.5 rounded-full bg-[var(--primary)] animate-pulse"
            aria-hidden
          />
        ) : data.status === "mastered" ? (
          <span className="text-[var(--success)]" aria-hidden>
            <Trophy size={16} />
          </span>
        ) : data.status === "completed" ? (
          <span className="text-[var(--success)]" aria-hidden>
            <CheckCircle2 size={16} />
          </span>
        ) : data.status === "review_required" ? (
          <span className="text-[var(--primary)]" aria-hidden>
            <PlayCircle size={15} />
          </span>
        ) : data.status === "locked" ? (
          <span className="text-[var(--muted)]" aria-hidden>
            <Lock size={14} />
          </span>
        ) : (
          <span className="text-[var(--muted)]" aria-hidden>
            <CircleDashed size={14} />
          </span>
        )}
      </div>

      <div className="mt-3">
        <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
          {data.category}
        </div>
        <h3 className="mt-1 text-sm font-black leading-snug text-[var(--ink)]">
          {data.title}
        </h3>
        <p className="mt-1 text-xs text-[var(--muted)] line-clamp-2">
          {data.description}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-[var(--muted)]">
        <span>{data.estimatedDuration}</span>
        <span>
          {data.prerequisiteIds.length > 0
            ? `${data.prerequisiteIds.length} prereq`
            : "Start here"}
        </span>
      </div>
      {data.choices?.length ? (
        <RoadmapNodeChoicePicker
          node={data}
          selectedChoiceId={data.selectedChoiceId ?? null}
          onChange={(choiceId) => data.onChoiceChange?.(data.id, choiceId)}
          compact
        />
      ) : null}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-[var(--line)] !border-[var(--surface)]"
      />
    </div>
  );
}
