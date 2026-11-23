"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useMadaraStore } from "../../store/madara-store";
import { PageSubnav } from "../shell/page-subnav";
import { Card } from "../ui/card";

export function DailyChallengeContent() {
  const [seconds, setSeconds] = useState(300);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const addXp = useMadaraStore((s) => s.addXp);
  const showToast = useMadaraStore((s) => s.showToast);
  useEffect(() => {
    if (!running || seconds <= 0 || done) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [running, seconds, done]);
  const mm = String(Math.floor(seconds / 60)).padStart(1, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return (
    <Card className="p-5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-black tracking-widest text-[var(--primary)]">
          DAILY CHALLENGE
        </span>
        <span className="flex items-center gap-1 text-sm font-bold">
          <Clock size={16} /> {mm}:{ss}
        </span>
      </div>
      <h3 className="font-bold text-lg mt-2">5 soal campuran</h3>
      <p className="text-sm text-[var(--muted)]">
        Hanzi, nada, dan arti kata. Selesaikan untuk menjaga streak.
      </p>
      {!running && !done && (
        <button
          type="button"
          onClick={() => setRunning(true)}
          className="mt-4 min-h-[48px] px-5 rounded-full bg-[var(--primary)] text-white font-bold"
        >
          Mulai Challenge
        </button>
      )}
      {running && !done && (
        <button
          type="button"
          onClick={() => {
            setDone(true);
            setRunning(false);
            addXp(25);
            showToast("+25 XP · Daily Challenge selesai!");
          }}
          className="mt-4 min-h-[48px] px-5 rounded-full bg-[var(--primary)] text-white font-bold"
        >
          Selesaikan (+25 XP)
        </button>
      )}
      {done && (
        <div className="mt-4 rounded-2xl bg-[#EAF6F0] text-[#1D7A52] p-4 font-bold">
          Challenge selesai! +25 XP
        </div>
      )}
    </Card>
  );
}

export function DailyChallengePage() {
  return (
    <section className="max-w-[980px] mx-auto space-y-4">
      <div>
        <h1 className="text-[28px] font-black">Daily Challenge</h1>
        <p className="text-[var(--muted)]">
          Tantangan harian singkat untuk menjaga konsistensi.
        </p>
      </div>
      <PageSubnav />
      <DailyChallengeContent />
    </section>
  );
}
