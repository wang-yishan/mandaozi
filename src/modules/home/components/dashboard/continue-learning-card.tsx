"use client";

import { ArrowRight, Clock3, Sparkles } from "lucide-react";
import Link from "next/link";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { DashboardRecommendation } from "../../types/dashboard";

const STATE_LABEL: Record<DashboardRecommendation["state"], string> = {
  new: "Start your journey",
  continue: "Your next learning step",
  review: "Review recommended",
  weak: "Skill focus",
  completed_stage: "Stage complete",
};

interface ContinueLearningCardProps {
  recommendation: DashboardRecommendation;
}

export function ContinueLearningCard({
  recommendation,
}: ContinueLearningCardProps) {
  return (
    <section
      aria-labelledby="continue-learning-title"
      className="relative overflow-hidden rounded-[24px] border border-[color:color-mix(in_srgb,var(--primary)_18%,var(--line))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_14%,var(--surface)),var(--surface)_45%,color-mix(in_srgb,var(--accent)_10%,var(--surface)))] p-5 shadow-[var(--shadow-card)] sm:p-6"
    >
      <div
        className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)] blur-2xl"
        aria-hidden="true"
      />
      <div className="relative space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[var(--primary)]">
            <Sparkles size={12} />
            {STATE_LABEL[recommendation.state]}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-[11px] font-bold text-[var(--muted)]">
            <Clock3 size={12} />
            Estimated time: {recommendation.estimatedMinutes} minutes
          </span>
        </div>

        <div className="max-w-3xl space-y-2">
          <p className="text-sm font-bold text-[var(--primary)]">
            {recommendation.category}
          </p>
          <h2
            id="continue-learning-title"
            className="text-2xl font-black tracking-tight text-[var(--ink)] sm:text-3xl"
          >
            {recommendation.title}
          </h2>
          <p className="text-sm font-semibold text-[var(--muted)]">
            {recommendation.stageLabel}
          </p>
          <p className="max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
            {recommendation.objective}
          </p>
        </div>

        {typeof recommendation.progressPercent === "number" && (
          <div className="max-w-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--muted)]">
              <span>Lesson progress</span>
              <span>{recommendation.progressPercent}%</span>
            </div>
            <ProgressBar
              value={recommendation.progressPercent}
              label="Recommended lesson progress"
              indicatorClassName="bg-[linear-gradient(90deg,var(--primary),var(--accent))]"
            />
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl rounded-2xl border border-[var(--line)] bg-[color:color-mix(in_srgb,var(--surface)_88%,transparent)] px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[var(--muted)]">
              Why this is recommended
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--ink)]">
              {recommendation.reason}
            </p>
          </div>

          <Link
            href={recommendation.href}
            className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 text-sm font-black text-white shadow-[0_10px_24px_rgba(79,70,229,0.28)] transition hover:bg-[var(--primary-strong)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
          >
            {recommendation.ctaLabel}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
