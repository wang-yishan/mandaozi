"use client";

import { Target } from "lucide-react";
import { useMadaraStore } from "../../store/madara-store";
import { PageSubnav } from "../shell/page-subnav";
import { Card } from "../ui/card";

const TASKS = [
  { id: "words", label: "Belajar 5 kata baru", xp: 20 },
  { id: "lesson", label: "Selesaikan 1 pelajaran", xp: 40 },
  { id: "tones", label: "Latihan nada 3 menit", xp: 20 },
  { id: "review", label: "Review 10 kartu", xp: 15 },
  { id: "challenge", label: "Selesaikan Daily Challenge", xp: 25 },
];

export function HomeMissionsPage() {
  const s = useMadaraStore();
  const allDone = s.tasksDone.length >= 5;
  return (
    <section className="max-w-[980px] mx-auto space-y-4">
      <div>
        <h1 className="text-[28px] font-black">Daily Missions</h1>
        <p className="text-[var(--muted)]">
          Selesaikan misi harian untuk menjaga ritme belajar.
        </p>
      </div>
      <PageSubnav />

      <Card className="p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-black flex items-center gap-2">
            <Target size={18} /> Tugas Harian
          </h2>
          <span className="text-sm text-[var(--muted)]">
            {s.tasksDone.length}/5
          </span>
        </div>
        <div className="grid gap-2 mt-4">
          {TASKS.map((t) => {
            const done = s.tasksDone.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  s.toggleTask(t.id, t.xp);
                  s.showToast(
                    done ? "Tugas dibatalkan" : `+${t.xp} XP · ${t.label}`,
                  );
                }}
                className="flex items-center justify-between p-3 rounded-2xl border text-left"
                style={{
                  borderColor: done ? "var(--primary)" : "var(--line)",
                  background: done ? "var(--primary-soft)" : "var(--surface)",
                }}
              >
                <span className="font-semibold text-sm">
                  {done ? "✓ " : ""}
                  {t.label}
                </span>
                <span className="text-xs font-black text-[var(--primary)]">
                  +{t.xp} XP
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          disabled={!allDone || s.claimedDailyReward}
          onClick={() => {
            s.claimDailyReward();
            s.showToast("+50 XP · Hadiah harian diklaim!");
          }}
          className="mt-4 w-full min-h-[48px] rounded-full font-bold text-sm disabled:opacity-50 bg-[var(--primary)] text-white"
        >
          {s.claimedDailyReward
            ? "Hadiah sudah diklaim"
            : allDone
              ? "Klaim Hadiah +50 XP"
              : "Selesaikan semua tugas untuk klaim"}
        </button>
      </Card>
    </section>
  );
}
