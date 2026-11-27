"use client";

import { Check, RotateCcw } from "lucide-react";
import type { RoadmapNodeDef } from "../types/roadmap";

interface Props {
  node: RoadmapNodeDef;
  selectedChoiceId: string | null;
  onChange: (choiceId: string | null) => void;
  /** compact = inside roadmap node card */
  compact?: boolean;
}

export function RoadmapNodeChoicePicker({
  node,
  selectedChoiceId,
  onChange,
  compact = false,
}: Props) {
  const choices = node.choices;
  if (!choices?.length) return null;

  return (
    <div className={compact ? "mt-3" : "mt-3"}>
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] font-black uppercase tracking-[0.08em] text-[var(--muted)]">
          Varian Node
        </div>
        {selectedChoiceId ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="inline-flex min-h-[32px] items-center gap-1 rounded-lg px-2 text-[11px] font-bold text-[var(--muted)] hover:bg-[var(--bg)]"
            aria-label={`Reset pilihan ${node.title}`}
          >
            <RotateCcw size={12} /> Reset
          </button>
        ) : null}
      </div>
      <div className={`mt-2 grid gap-2 ${compact ? "" : "sm:grid-cols-2"}`}>
        {choices.map((choice) => {
          const active = selectedChoiceId === choice.id;
          return (
            <button
              key={choice.id}
              type="button"
              aria-pressed={active}
              onClick={(e) => {
                e.stopPropagation();
                onChange(active ? null : choice.id);
              }}
              className={`min-h-[44px] rounded-xl border px-3 py-2 text-left transition ${
                active
                  ? "border-[var(--primary)] bg-[var(--primary-soft)]/40 text-[var(--ink)]"
                  : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--bg)]"
              }`}
            >
              <div className="flex items-start gap-2">
                <span
                  className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
                    active
                      ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                      : "border-[var(--muted)] text-transparent"
                  }`}
                  aria-hidden
                >
                  <Check size={10} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold leading-snug">
                    {choice.label}
                  </span>
                  {choice.description ? (
                    <span
                      className={`mt-0.5 block text-[11px] leading-snug text-[var(--muted)] ${
                        compact ? "line-clamp-2" : ""
                      }`}
                    >
                      {choice.description}
                    </span>
                  ) : null}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
