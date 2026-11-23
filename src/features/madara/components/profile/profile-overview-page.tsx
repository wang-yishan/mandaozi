"use client";

import { Award, Flame, Star, Target } from "lucide-react";
import { useMadaraStore } from "../../store/madara-store";
import { PageSubnav } from "../shell/page-subnav";
import { Card } from "../ui/card";
import { SaveIndicator } from "../ui/save-indicator";

export function ProfileOverviewPage() {
  const s = useMadaraStore();
  return (
    <section className="max-w-[760px] mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-black">Profile Overview</h1>
          <p className="text-sm text-[var(--muted)]">
            Ringkasan akun dan perjalanan belajarmu.
          </p>
        </div>
        <SaveIndicator />
      </div>
      <PageSubnav />

      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-[var(--ink)] text-white hanzi text-3xl grid place-items-center">
            学
          </div>
          <div>
            <div className="font-black text-xl">Ikhsan</div>
            <div className="text-sm text-[var(--muted)]">
              {s.level} · {s.xp.toLocaleString()} XP · Streak {s.streakDays}{" "}
              hari
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-[var(--muted)] text-xs font-bold">
            <Star size={14} /> XP
          </div>
          <div className="text-2xl font-black mt-2">
            {s.xp.toLocaleString()}
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-[var(--muted)] text-xs font-bold">
            <Flame size={14} /> Streak
          </div>
          <div className="text-2xl font-black mt-2">{s.streakDays} hari</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-[var(--muted)] text-xs font-bold">
            <Target size={14} /> Pelajaran
          </div>
          <div className="text-2xl font-black mt-2">{s.lessonsCompleted}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-[var(--muted)] text-xs font-bold">
            <Award size={14} /> Akurasi
          </div>
          <div className="text-2xl font-black mt-2">{s.accuracy}%</div>
        </Card>
      </div>
    </section>
  );
}
