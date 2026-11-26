"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Brain,
  Ear,
  Languages,
  Mic2,
  Minus,
  PenLine,
} from "lucide-react";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { MasterySkillId, SkillMastery } from "../../types/dashboard";

interface LearningMasteryOverviewProps {
  skills: SkillMastery[];
}

const SKILL_ICON: Record<MasterySkillId, typeof BookOpen> = {
  hanzi: Languages,
  vocabulary: BookOpen,
  pronunciation: Mic2,
  listening: Ear,
  grammar: Brain,
  reading: PenLine,
};

function Trend({ trend }: { trend: SkillMastery["trend"] }) {
  if (trend === "up") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--success)]">
        <ArrowUpRight size={14} /> Improving
      </span>
    );
  }
  if (trend === "down") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--warning)]">
        <ArrowDownRight size={14} /> Needs focus
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--muted)]">
      <Minus size={14} /> Stable
    </span>
  );
}

export function LearningMasteryOverview({
  skills,
}: LearningMasteryOverviewProps) {
  const recommended = skills.filter((s) => s.recommended).map((s) => s.label);

  return (
    <section
      aria-labelledby="learning-mastery-title"
      className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)]">
            Skill mastery
          </p>
          <h2
            id="learning-mastery-title"
            className="mt-1 text-xl font-black text-[var(--ink)]"
          >
            Learning Mastery Overview
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
            Mastery reflects assessment and practice signals, not just lesson
            completion or EXP.
          </p>
        </div>
        {recommended.length > 0 && (
          <div className="rounded-2xl bg-[var(--warning-bg)] px-3 py-2 text-xs font-bold text-[var(--warning)]">
            Recommended focus: {recommended.join(", ")}
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {skills.map((skill) => {
          const Icon = SKILL_ICON[skill.id];
          return (
            <article
              key={skill.id}
              className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--surface)] text-[var(--primary)] border border-[var(--line)]">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-bold text-[var(--ink)]">
                      {skill.label}
                    </h3>
                    <p className="text-[11px] font-semibold text-[var(--muted)]">
                      Last assessed: {skill.lastAssessedAt}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-[var(--ink)]">
                    {skill.score}%
                  </div>
                  <Trend trend={skill.trend} />
                </div>
              </div>
              <div className="mt-3">
                <ProgressBar
                  value={skill.score}
                  label={`${skill.label} mastery`}
                  indicatorClassName={
                    skill.recommended
                      ? "bg-[linear-gradient(90deg,var(--warning),var(--primary))]"
                      : "bg-[linear-gradient(90deg,var(--primary),var(--accent))]"
                  }
                />
              </div>
              <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
                {skill.note}
              </p>
              {skill.recommended && (
                <p className="mt-2 text-xs font-bold text-[var(--primary)]">
                  Recommended area for improvement
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
