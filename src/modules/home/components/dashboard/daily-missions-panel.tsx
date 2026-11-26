"use client";

import {
  BookOpen,
  CheckCircle2,
  Circle,
  Clock3,
  Dumbbell,
  RotateCcw,
  Sparkles,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { DailyMission, MissionCategory } from "../../types/dashboard";

interface DailyMissionsPanelProps {
  completed: number;
  total: number;
  missions: DailyMission[];
  onToggleMission: (missionId: string) => void;
}

const CATEGORY_META: Record<
  MissionCategory,
  { label: string; icon: typeof BookOpen; className: string }
> = {
  learn: {
    label: "Learn",
    icon: BookOpen,
    className: "bg-[var(--primary-soft)] text-[var(--primary)]",
  },
  practice: {
    label: "Practice",
    icon: Dumbbell,
    className: "bg-[var(--accent-soft)] text-[var(--accent)]",
  },
  review: {
    label: "Review",
    icon: RotateCcw,
    className: "bg-[var(--warning-bg)] text-[var(--warning)]",
  },
  assessment: {
    label: "Assessment",
    icon: Trophy,
    className: "bg-[var(--success-bg)] text-[var(--success)]",
  },
  challenge: {
    label: "Challenge",
    icon: Sparkles,
    className:
      "bg-[color:color-mix(in_srgb,var(--primary)_10%,var(--surface))] text-[var(--primary)]",
  },
};

export function DailyMissionsPanel({
  completed,
  total,
  missions,
  onToggleMission,
}: DailyMissionsPanelProps) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <section
      aria-labelledby="daily-missions-title"
      className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)]">
            Adaptive daily missions
          </p>
          <h2
            id="daily-missions-title"
            className="mt-1 text-xl font-black text-[var(--ink)]"
          >
            Today&apos;s Missions
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Personalized activities based on your stage, skills, and review
            schedule.
          </p>
        </div>
        <div className="shrink-0 rounded-2xl bg-[var(--bg)] px-3 py-2 text-right">
          <div className="text-xs font-bold text-[var(--muted)]">Completed</div>
          <div className="text-lg font-black text-[var(--ink)]">
            {completed} / {total}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-[var(--muted)]">
          <span>Daily progress</span>
          <span>{percent}%</span>
        </div>
        <ProgressBar
          value={completed}
          max={total || 1}
          label="Daily mission completion"
          indicatorClassName="bg-[linear-gradient(90deg,var(--primary),var(--success))]"
        />
      </div>

      <div className="mt-4 space-y-3">
        {missions.map((mission) => {
          const meta = CATEGORY_META[mission.category];
          const Icon = meta.icon;
          return (
            <div
              key={mission.id}
              className={`rounded-2xl border p-3 transition ${
                mission.completed
                  ? "border-[color:color-mix(in_srgb,var(--success)_25%,var(--line))] bg-[color:color-mix(in_srgb,var(--success-bg)_70%,var(--surface))]"
                  : "border-[var(--line)] bg-[var(--bg)]"
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => onToggleMission(mission.id)}
                  className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] transition hover:text-[var(--primary)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
                  aria-label={
                    mission.completed
                      ? `Mark ${mission.title} incomplete`
                      : `Mark ${mission.title} complete`
                  }
                  aria-pressed={mission.completed}
                >
                  {mission.completed ? (
                    <CheckCircle2 size={20} className="text-[var(--success)]" />
                  ) : (
                    <Circle size={20} />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.className}`}
                    >
                      <Icon size={12} />
                      {meta.label}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--muted)]">
                      <Clock3 size={12} />
                      {mission.estimatedMinutes} min
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p
                        className={`text-sm font-bold ${
                          mission.completed
                            ? "text-[var(--muted)] line-through"
                            : "text-[var(--ink)]"
                        }`}
                      >
                        {mission.title}
                      </p>
                      <Link
                        href={mission.href}
                        className="mt-1 inline-flex min-h-[44px] items-center text-sm font-semibold text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] rounded-md"
                      >
                        Open activity
                      </Link>
                    </div>
                    <span className="rounded-full bg-[var(--surface)] px-2.5 py-1 text-xs font-black text-[var(--primary)] border border-[var(--line)]">
                      +{mission.xpReward} EXP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
