"use client";
import { useMadaraStore } from "../../store/madara-store";

export function Toast() {
  const toast = useMadaraStore((s) => s.toast);
  if (!toast) return null;
  return (
    <output
      aria-live="polite"
      className="fixed left-1/2 top-[calc(var(--safe-area-inset-top)+14px)] z-[80] max-w-[92vw] -translate-x-1/2 rounded-2xl bg-[var(--ink)] px-4 py-3 text-center text-sm font-bold text-white shadow-xl"
    >
      {toast}
    </output>
  );
}
