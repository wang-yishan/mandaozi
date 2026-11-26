"use client";

import { BarChart3, BookOpen, Flame, Star, Target } from "lucide-react";
import { PageSubnav } from "@/components/layout/page-subnav";
import { Card } from "@/components/ui/card";
import { useMadaraStore } from "@/store/madara-store";

export function HomeStatsPage() {
  const s = useMadaraStore();
  const stats = [
    { label: "Total XP", value: s.xp.toLocaleString(), icon: Star },
    { label: "Kata Dikuasai", value: String(s.wordsMastered), icon: BookOpen },
    {
      label: "Pelajaran Selesai",
      value: String(s.lessonsCompleted),
      icon: Target,
    },
    { label: "Streak", value: `${s.streakDays} hari`, icon: Flame },
    { label: "Akurasi", value: `${s.accuracy}%`, icon: BarChart3 },
    { label: "Favorit", value: String(s.favorites.length), icon: Star },
  ];

  const weekly = [
    { day: "Sen", value: 40 },
    { day: "Sel", value: 65 },
    { day: "Rab", value: 55 },
    { day: "Kam", value: 80 },
    { day: "Jum", value: 70 },
    { day: "Sab", value: 90 },
    { day: "Min", value: Math.min(100, Math.max(30, s.accuracy)) },
  ];

  return (
    <section className="max-w-[980px] mx-auto space-y-4">
      <div>
        <h1 className="text-[28px] font-black">Learning Stats</h1>
        <p className="text-[var(--muted)]">
          Ringkasan progres belajarmu dari waktu ke waktu.
        </p>
      </div>
      <PageSubnav />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="p-4">
              <div className="flex items-center gap-2 text-[var(--muted)]">
                <Icon size={16} />
                <span className="text-xs font-bold">{item.label}</span>
              </div>
              <div className="text-2xl font-black mt-2">{item.value}</div>
            </Card>
          );
        })}
      </div>

      <Card className="p-5">
        <h2 className="text-lg font-black flex items-center gap-2">
          <BarChart3 size={18} /> Aktivitas Mingguan
        </h2>
        <p className="text-sm text-[var(--muted)] mt-1">
          Gambaran konsistensi belajar minggu ini.
        </p>
        <div className="grid grid-cols-7 gap-2 mt-4 items-end h-[160px]">
          {weekly.map((d) => (
            <div key={d.day} className="flex flex-col items-center gap-2">
              <div className="w-full bg-[var(--bg)] rounded-full overflow-hidden h-[120px] flex items-end">
                <div
                  className="w-full bg-[var(--primary)] rounded-full"
                  style={{ height: `${d.value}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-[var(--muted)]">
                {d.day}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
