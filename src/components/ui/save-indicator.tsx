"use client";
import { useMadaraStore } from "@/store/madara-store";

export function SaveIndicator() {
  const status = useMadaraStore((s) => s.saveStatus);
  if (status === "idle") return null;
  const label =
    status === "saving"
      ? "Menyimpan…"
      : status === "saved"
        ? "Tersimpan"
        : "Belum tersimpan";
  const tone =
    status === "error"
      ? "bg-[#FFF1F0] text-[#B42318] border-[#F3C2C2]"
      : "bg-[var(--surface)] text-[var(--muted)] border-[var(--line)]";
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold ${tone}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${status === "saving" ? "bg-[var(--vermillion)] animate-pulse" : status === "saved" ? "bg-[#22A06B]" : "bg-[#B42318]"}`}
      />
      {label}
    </div>
  );
}
