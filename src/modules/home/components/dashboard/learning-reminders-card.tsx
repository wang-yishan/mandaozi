"use client";

import { BellRing, CalendarClock, CheckCircle2, Flame } from "lucide-react";
import Link from "next/link";
import type { LearningReminder } from "../../types/dashboard";

interface LearningRemindersCardProps {
  reminders: LearningReminder[];
}

const KIND_ICON = {
  review: CheckCircle2,
  assessment: CalendarClock,
  streak: Flame,
  event: BellRing,
} as const;

export function LearningRemindersCard({
  reminders,
}: LearningRemindersCardProps) {
  return (
    <section
      aria-labelledby="learning-reminders-title"
      className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]"
    >
      <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)]">
        Stay on track
      </p>
      <h2
        id="learning-reminders-title"
        className="mt-1 text-xl font-black text-[var(--ink)]"
      >
        Learning Reminders
      </h2>
      <div className="mt-4 space-y-3">
        {reminders.map((reminder) => {
          const Icon = KIND_ICON[reminder.kind];
          return (
            <Link
              key={reminder.id}
              href={reminder.href}
              className="flex min-h-[44px] items-start gap-3 rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-3 transition hover:bg-[color:color-mix(in_srgb,var(--primary-soft)_35%,var(--surface))] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
            >
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--surface)] text-[var(--primary)] border border-[var(--line)]">
                <Icon size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--ink)]">
                  {reminder.title}
                </p>
                <p className="mt-0.5 text-xs leading-5 text-[var(--muted)]">
                  {reminder.detail}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
