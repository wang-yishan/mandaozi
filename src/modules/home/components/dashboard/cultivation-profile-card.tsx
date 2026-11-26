"use client";

import { Bell, Diamond, Flame } from "lucide-react";
import Link from "next/link";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { CultivationProfile } from "../../types/dashboard";

interface CultivationProfileCardProps {
  profile: CultivationProfile;
  compact?: boolean;
}

export function CultivationProfileCard({
  profile,
  compact = false,
}: CultivationProfileCardProps) {
  return (
    <section
      aria-label="Cultivation profile"
      className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--primary),var(--accent))] text-base font-black text-white shadow-sm"
            aria-hidden="true"
          >
            {profile.avatarLabel}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
              {profile.rank}
            </p>
            <h2 className="truncate text-base font-black text-[var(--ink)] sm:text-lg">
              Level {String(profile.level).padStart(2, "0")}
            </h2>
            {!compact && (
              <p className="text-sm text-[var(--muted)]">
                Welcome back, {profile.greetingName}!
              </p>
            )}
          </div>
        </div>

        <Link
          href="/profile"
          className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] transition hover:text-[var(--primary)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
          aria-label={`Notifications, ${profile.notificationCount} unread`}
        >
          <Bell size={18} />
          {profile.notificationCount > 0 && (
            <span className="absolute -right-1 -top-1 grid min-w-5 h-5 place-items-center rounded-full bg-[var(--primary)] px-1 text-[10px] font-black text-white">
              {profile.notificationCount}
            </span>
          )}
        </Link>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between gap-3 text-xs font-bold">
          <span className="text-[var(--muted)]">Cultivation EXP</span>
          <span className="text-[var(--ink)]">
            {profile.currentExp.toLocaleString()} /{" "}
            {profile.nextLevelExp.toLocaleString()} EXP
          </span>
        </div>
        <ProgressBar
          value={profile.currentExp}
          max={profile.nextLevelExp}
          label="Cultivation experience progress"
          indicatorClassName="bg-[linear-gradient(90deg,var(--primary),var(--accent))]"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="flex min-h-[44px] items-center gap-2 rounded-2xl bg-[var(--bg)] px-3 py-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--warning-bg)] text-[var(--warning)]">
            <Flame size={16} />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-black text-[var(--ink)]">
              {profile.streakDays} Day Streak
            </div>
            <div className="text-[11px] font-semibold text-[var(--muted)]">
              Keep the flame alive
            </div>
          </div>
        </div>
        <div className="flex min-h-[44px] items-center gap-2 rounded-2xl bg-[var(--bg)] px-3 py-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
            <Diamond size={16} />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-black text-[var(--ink)]">
              {profile.diamonds} Diamonds
            </div>
            <div className="text-[11px] font-semibold text-[var(--muted)]">
              Reward balance
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
