"use client";

import { BookA, Compass, Globe2, Mic2, Music2, PenTool } from "lucide-react";
import Link from "next/link";
import type { DiscoverItem } from "../../types/dashboard";

interface DiscoverExploreSectionProps {
  items: DiscoverItem[];
}

const ICONS = {
  hanzi: BookA,
  pronunciation: Mic2,
  music: Music2,
  writing: PenTool,
  vocabulary: Compass,
  culture: Globe2,
} as const;

export function DiscoverExploreSection({ items }: DiscoverExploreSectionProps) {
  return (
    <section
      aria-labelledby="discover-explore-title"
      className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)]">
            Discover & explore
          </p>
          <h2
            id="discover-explore-title"
            className="mt-1 text-xl font-black text-[var(--ink)]"
          >
            Expand Your Learning
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Optional paths to deepen your Mandarin beyond today’s main plan.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-3">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          return (
            <Link
              key={item.id}
              href={item.href}
              className="group flex min-h-[132px] flex-col rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4 transition hover:border-[color:color-mix(in_srgb,var(--primary)_25%,var(--line))] hover:bg-[color:color-mix(in_srgb,var(--primary-soft)_45%,var(--surface))] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--surface)] text-[var(--primary)] border border-[var(--line)] group-hover:border-[color:color-mix(in_srgb,var(--primary)_20%,var(--line))]">
                <Icon size={20} />
              </span>
              <h3 className="mt-3 text-sm font-black text-[var(--ink)]">
                {item.title}
              </h3>
              <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                {item.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
