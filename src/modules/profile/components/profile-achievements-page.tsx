"use client";

import { Award, Flame, Star, Target, Trophy } from "lucide-react";
import { PageSubnav } from "@/components/layout/page-subnav";
import { Card } from "@/components/ui/card";
import { useMadaraStore } from "@/store/madara-store";

export function ProfileAchievementsPage() {
  const s = useMadaraStore();
  const achievements = [
    {
      id: "first-steps",
      title: "First Steps",
      desc: "Selesaikan pelajaran pertamamu.",
      unlocked: s.lessonsCompleted >= 1 || s.completedLessons.length >= 1,
      icon: Star,
    },
    {
      id: "streak-7",
      title: "7 Day Streak",
      desc: "Pertahankan streak 7 hari.",
      unlocked: s.streakDays >= 7,
      icon: Flame,
    },
    {
      id: "xp-1000",
      title: "1000 XP",
      desc: "Kumpulkan 1000 XP.",
      unlocked: s.xp >= 1000,
      icon: Trophy,
    },
    {
      id: "words-50",
      title: "Word Collector",
      desc: "Kuasai 50 kata.",
      unlocked: s.wordsMastered >= 50,
      icon: Target,
    },
    {
      id: "favorites-5",
      title: "Curator",
      desc: "Simpan 5 kata favorit.",
      unlocked: s.favorites.length >= 5,
      icon: Award,
    },
  ];

  return (
    <section className="max-w-[760px] mx-auto space-y-4">
      <div>
        <h1 className="text-[28px] font-black">Achievements</h1>
        <p className="text-[var(--muted)]">
          Lencana pencapaian dari perjalanan belajarmu.
        </p>
      </div>
      <PageSubnav />

      <div className="grid gap-3">
        {achievements.map((a) => {
          const Icon = a.icon;
          return (
            <Card key={a.id} className="p-4 flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl grid place-items-center shrink-0"
                style={{
                  background: a.unlocked ? "var(--primary-soft)" : "var(--bg)",
                  color: a.unlocked ? "var(--primary)" : "var(--muted)",
                }}
              >
                <Icon size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-black">{a.title}</div>
                <div className="text-sm text-[var(--muted)]">{a.desc}</div>
              </div>
              <span
                className="text-xs font-bold px-2 py-1 rounded-full shrink-0"
                style={{
                  background: a.unlocked ? "#EAF6F0" : "var(--bg)",
                  color: a.unlocked ? "#1D7A52" : "var(--muted)",
                }}
              >
                {a.unlocked ? "Unlocked" : "Locked"}
              </span>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
