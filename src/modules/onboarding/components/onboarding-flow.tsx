"use client";

import { Check } from "lucide-react";
import { type Goal, type Level, useMadaraStore } from "@/store/madara-store";

const GOALS: { id: Goal; desc: string; emoji: string }[] = [
  { id: "Travel", desc: "Untuk perjalanan, makanan, dan arah", emoji: "🧳" },
  { id: "HSK", desc: "Kosakata terstruktur untuk ujian HSK", emoji: "🎓" },
  {
    id: "Conversation",
    desc: "Ngobrol dengan teman dan keluarga",
    emoji: "💬",
  },
  { id: "Culture", desc: "Cerita, makanan, dan sejarah", emoji: "🏮" },
];

const LEVELS: Level[] = [
  "Beginner · HSK 1–2",
  "Elementary · HSK 3",
  "Intermediate",
];

export function OnboardingFlow() {
  const step = useMadaraStore((s) => s.onboardingStep);
  const setStep = useMadaraStore((s) => s.setOnboardingStep);
  const goal = useMadaraStore((s) => s.goal);
  const level = useMadaraStore((s) => s.level);
  const dailyGoal = useMadaraStore((s) => s.dailyGoal);
  const setGoal = useMadaraStore((s) => s.setGoal);
  const setLevel = useMadaraStore((s) => s.setLevel);
  const setDailyGoal = useMadaraStore((s) => s.setDailyGoal);
  const complete = useMadaraStore((s) => s.completeOnboarding);

  return (
    <div
      className="app-theme min-h-[100dvh] bg-[var(--bg)] flex items-start sm:items-center justify-center p-4"
      style={{ paddingTop: "max(1rem, var(--safe-area-inset-top))" }}
    >
      <div className="w-full max-w-[520px] rounded-[28px] bg-[var(--surface)] border border-[var(--line)] p-6 sm:p-8 shadow-[var(--shadow)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="hanzi text-[22px] font-black leading-none">
              你<span style={{ color: "#C83C3C" }}>·</span>
            </span>
            <span className="font-black tracking-[0.28em] text-[13px]">
              MADARA
            </span>
          </div>
          <button
            type="button"
            onClick={complete}
            className="text-sm font-bold text-[var(--muted)] min-h-[44px] px-2"
          >
            Skip →
          </button>
        </div>

        <fieldset
          className="flex gap-2 mt-6 border-0 p-0 m-0 min-w-0"
          aria-label="Progress"
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 flex-1 rounded-full"
              style={{
                background: i <= step ? "var(--primary)" : "var(--line)",
              }}
            />
          ))}
        </fieldset>

        {step === 0 && (
          <div className="mt-6">
            <p className="text-xs font-black tracking-widest text-[var(--primary)]">
              LANGKAH 1 DARI 3
            </p>
            <h1 className="text-[30px] font-black leading-tight mt-2">
              Apa tujuanmu belajar Mandarin?
            </h1>
            <p className="text-[var(--muted)] mt-2">
              Kami akan menyesuaikan pelajaran pertamamu.
            </p>
            <div className="grid gap-3 mt-6">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id)}
                  className="flex items-center gap-3 p-4 rounded-2xl border-2 text-left"
                  style={{
                    borderColor:
                      goal === g.id ? "var(--primary)" : "var(--line)",
                    background:
                      goal === g.id ? "var(--primary-soft)" : "var(--surface)",
                  }}
                >
                  <span className="text-2xl">{g.emoji}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-bold">{g.id}</span>
                    <span className="block text-sm text-[var(--muted)]">
                      {g.desc}
                    </span>
                  </span>
                  {goal === g.id && (
                    <span className="w-6 h-6 rounded-full bg-[var(--primary)] text-white grid place-items-center">
                      <Check size={14} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="mt-6">
            <p className="text-xs font-black tracking-widest text-[var(--primary)]">
              LANGKAH 2 DARI 3
            </p>
            <h1 className="text-[30px] font-black leading-tight mt-2">
              Di level mana kamu sekarang?
            </h1>
            <p className="text-[var(--muted)] mt-2">
              Tidak perlu sempurna — kita mulai dari yang nyaman.
            </p>
            <div className="grid gap-2 mt-6">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  className="min-h-[56px] px-4 rounded-2xl border-2 text-left font-bold"
                  style={{
                    borderColor: level === l ? "var(--primary)" : "var(--line)",
                    background:
                      level === l ? "var(--primary-soft)" : "var(--surface)",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-6">
            <p className="text-xs font-black tracking-widest text-[var(--primary)]">
              LANGKAH 3 DARI 3
            </p>
            <h1 className="text-[30px] font-black leading-tight mt-2">
              Target harianmu?
            </h1>
            <p className="text-[var(--muted)] mt-2">
              Kecil tapi konsisten. Kamu bisa ubah kapan saja.
            </p>
            <div className="grid grid-cols-3 gap-2 mt-6">
              {[5, 10, 15].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDailyGoal(m as 5 | 10 | 15)}
                  className="rounded-2xl border-2 p-4 text-center"
                  style={{
                    borderColor:
                      dailyGoal === m ? "var(--primary)" : "var(--line)",
                    background:
                      dailyGoal === m
                        ? "var(--primary-soft)"
                        : "var(--surface)",
                  }}
                >
                  <div className="text-2xl font-black">{m}</div>
                  <div className="text-xs font-bold text-[var(--muted)]">
                    menit
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-[var(--bg)] p-4 text-sm">
              <b>Goal:</b> {goal} · <b>Level:</b> {level} ·{" "}
              <b>{dailyGoal} min/hari</b>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-2">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="min-h-[48px] px-4 rounded-full border border-[var(--line)] font-bold"
            >
              Kembali
            </button>
          )}
          <button
            type="button"
            onClick={() => (step < 2 ? setStep(step + 1) : complete())}
            className="flex-1 min-h-[48px] rounded-full bg-[var(--primary)] text-white font-bold"
          >
            {step < 2 ? "Lanjut" : "Mulai perjalanan →"}
          </button>
        </div>
        <p className="text-center text-xs text-[var(--muted)] mt-3">
          Tidak perlu akun. Progres tersimpan di perangkat ini.
        </p>
      </div>
    </div>
  );
}
