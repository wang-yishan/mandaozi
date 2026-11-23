"use client";

import { Star, Trophy, Calendar } from "lucide-react";
import { Card } from "../ui/card";

export function HomeRightSection() {
  return (
    <div className="space-y-4">
      {/* Today's Focus */}
      <Card className="p-4">
        <h3 className="font-black flex items-center gap-2 text-sm">
          <Star size={16} className="text-[var(--primary)]" />
          Today's Focus
        </h3>
        <p className="text-sm text-[var(--muted)] mt-2">
          Focus on vocabulary review to strengthen your foundation.
        </p>
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-bold">Review Progress</span>
            <span className="font-bold">65%</span>
          </div>
          <div className="w-full bg-[var(--bg)] rounded-full h-2">
            <div className="bg-[var(--primary)] rounded-full h-2" style={{ width: '65%' }}></div>
          </div>
        </div>
      </Card>

      {/* Leaderboard */}
      <Card className="p-4">
        <h3 className="font-black flex items-center gap-2 text-sm">
          <Trophy size={16} className="text-[var(--primary)]" />
          Leaderboard
        </h3>
        <div className="mt-3 space-y-2">
          {[
            { rank: 1, name: "Alex", xp: 12500, flag: "🇺🇸" },
            { rank: 2, name: "Sarah", xp: 11800, flag: "🇬🇧" },
            { rank: 3, name: "Mandaozi", xp: 9200, flag: "🇨🇳" },
            { rank: 4, name: "Ben", xp: 8700, flag: "🇦🇺" },
            { rank: 5, name: "Lisa", xp: 7600, flag: "🇰🇷" },
          ].map((user) => (
            <div key={user.rank} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-black w-5">{user.rank}</span>
                <span className="flex items-center gap-1">
                  {user.flag}
                  <span className="font-semibold">{user.name}</span>
                </span>
              </div>
              <span className="text-xs font-bold text-[var(--muted)]">{user.xp.toLocaleString()} XP</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Upcoming */}
      <Card className="p-4">
        <h3 className="font-black flex items-center gap-2 text-sm">
          <Calendar size={16} className="text-[var(--primary)]" />
          Upcoming
        </h3>
        <div className="mt-3 space-y-3">
          {[
            { title: "Weekly Quiz", time: "Today, 18:00", type: "Quiz" },
            { title: "Live Session", time: "Tomorrow, 19:00", type: "Live" },
            { title: " Vocabulary Drill", time: "Nov 25, 10:00", type: "Practice" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="mt-1">
                <span className="block text-[11px] font-bold text-[var(--primary)]">
                  {item.type}
                </span>
                <span className="block text-[10px] text-[var(--muted)]">
                  {item.time}
                </span>
              </div>
              <span className="text-sm font-semibold">{item.title}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
