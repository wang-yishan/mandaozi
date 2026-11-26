"use client";

import { usePhonicsStore } from "../store";
import type { PhonicsDisplayMode } from "../types";

const MODES: Array<{ id: PhonicsDisplayMode; label: string }> = [
  { id: "pinyin", label: "Pinyin" },
  { id: "zhuyin", label: "Zhuyin" },
  { id: "both", label: "Both" },
];

export function DisplayToggle() {
  const mode = usePhonicsStore((s) => s.displayMode);
  const setMode = usePhonicsStore((s) => s.setDisplayMode);
  return (
    <div className="flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface)] p-1">
      {MODES.map((m) => {
        const active = m.id === mode;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`min-h-[36px] px-3 rounded-full text-xs font-bold transition ${
              active
                ? "bg-[var(--primary)] text-white"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
            aria-pressed={active}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

export function usePhonicsLabel() {
  const mode = usePhonicsStore((s) => s.displayMode);
  return (pinyin?: string, zhuyin?: string) => {
    if (mode === "pinyin") return pinyin ?? zhuyin ?? "";
    if (mode === "zhuyin") return zhuyin ?? pinyin ?? "";
    if (pinyin && zhuyin) return `${pinyin} / ${zhuyin}`;
    return pinyin ?? zhuyin ?? "";
  };
}
