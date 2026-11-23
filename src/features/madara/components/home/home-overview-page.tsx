"use client";

import { BookOpen, ChevronRight, Flame, Star } from "lucide-react";
import { useMadaraStore } from "../../store/madara-store";
import { PageSubnav } from "../shell/page-subnav";
import { Card } from "../ui/card";
import { SaveIndicator } from "../ui/save-indicator";

export function HomeOverviewPage() {
  const s = useMadaraStore();
  return (
    <section className="max-w-[980px] mx-auto space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--muted)]">Selamat datang kembali</p>
          <h1 className="text-[28px] font-black leading-tight mt-1">
            你好, Ikhsan
          </h1>
          <p className="text-[var(--muted)]">
            Satu pelajaran kecil. Satu langkah maju.
          </p>
        </div>
        <SaveIndicator />
      </div>
      <PageSubnav />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="text-2xl font-black">{s.xp.toLocaleString()}</div>
          <div className="text-xs font-bold text-[var(--muted)] mt-1">
            Total XP
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-black">{s.wordsMastered}</div>
          <div className="text-xs font-bold text-[var(--muted)] mt-1">Kata</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-black flex items-center gap-1">
            <Flame size={20} className="text-[var(--vermillion)]" />{" "}
            {s.streakDays}
          </div>
          <div className="text-xs font-bold text-[var(--muted)] mt-1">
            Streak
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-black">{s.accuracy}%</div>
          <div className="text-xs font-bold text-[var(--muted)] mt-1">
            Akurasi
          </div>
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <Card className="p-5">
          <h2 className="font-black flex items-center gap-2">
            <BookOpen size={18} /> Lanjut Belajar
          </h2>
          <p className="text-sm text-[var(--muted)] mt-1">
            Greetings · Pelajaran 3 — 你好吗?
          </p>
          <button
            type="button"
            onClick={() => s.setPage("lesson")}
            className="mt-3 min-h-[44px] px-4 rounded-full bg-[var(--primary)] text-white font-bold text-sm"
          >
            Lanjutkan →
          </button>
        </Card>
        <Card className="p-5">
          <h2 className="font-black flex items-center gap-2">
            <Star size={18} /> Jelajahi Fitur
          </h2>
          <p className="text-sm text-[var(--muted)] mt-1">
            54 fitur tersedia di katalog All Features.
          </p>
          <button
            type="button"
            onClick={() => s.setAllFeaturesOpen(true)}
            className="mt-3 min-h-[44px] px-4 rounded-full border border-[var(--line)] font-bold text-sm flex items-center gap-2"
          >
            Buka All Features <ChevronRight size={16} />
          </button>
        </Card>
      </div>
    </section>
  );
}
