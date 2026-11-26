"use client";

import { CalendarCheck, CheckCircle2, Flame } from "lucide-react";
import { PageSubnav } from "@/components/layout/page-subnav";
import { Card } from "@/components/ui/card";
import { useMadaraStore } from "@/store/madara-store";

export function HomeStreakPage() {
  const s = useMadaraStore();
  const recentDays = Array.from({ length: 14 }, (_, i) => {
    const day = 14 - i;
    const active = day <= s.streakDays;
    return { dayLabel: `H-${day - 1}`, active };
  });

  return (
    <section className="max-w-[980px] mx-auto space-y-4">
      <div>
        <h1 className="text-[28px] font-black">Streak History</h1>
        <p className="text-[var(--muted)]">
          Riwayat konsistensi belajar dari hari ke hari.
        </p>
      </div>
      <PageSubnav />

      <div className="grid sm:grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-[var(--muted)] text-xs font-bold">
            <Flame size={16} /> Streak Saat Ini
          </div>
          <div className="text-3xl font-black mt-2">{s.streakDays} hari</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-[var(--muted)] text-xs font-bold">
            <CheckCircle2 size={16} /> Pelajaran Selesai
          </div>
          <div className="text-3xl font-black mt-2">
            {s.completedLessons.length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-[var(--muted)] text-xs font-bold">
            <CalendarCheck size={16} /> Tugas Hari Ini
          </div>
          <div className="text-3xl font-black mt-2">{s.tasksDone.length}/5</div>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-lg font-black">14 Hari Terakhir</h2>
        <div className="grid grid-cols-7 gap-2 mt-4">
          {recentDays.map((d, idx) => (
            <div
              key={`${d.dayLabel}-${idx}`}
              className="aspect-square rounded-xl grid place-items-center text-[11px] font-bold border"
              style={{
                background: d.active ? "var(--primary-soft)" : "var(--bg)",
                borderColor: d.active ? "var(--primary)" : "var(--line)",
                color: d.active ? "var(--primary)" : "var(--muted)",
              }}
              title={d.active ? "Aktif" : "Tidak aktif"}
            >
              {d.active ? "✓" : ""}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-lg font-black">Pelajaran yang Diselesaikan</h2>
        <div className="grid gap-2 mt-4">
          {s.completedLessons.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              Belum ada pelajaran selesai. Mulai dari World untuk membangun
              streak.
            </p>
          ) : (
            s.completedLessons.map((lesson) => (
              <div
                key={lesson}
                className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg)] border border-[var(--line)]"
              >
                <span className="font-semibold">{lesson}</span>
                <span className="text-xs font-bold text-[#1D7A52] bg-[#EAF6F0] px-2 py-1 rounded-full">
                  Selesai
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </section>
  );
}
