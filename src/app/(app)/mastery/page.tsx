export const instant = false;

import { headers } from "next/headers";
import Link from "next/link";
import { BookOpen, GraduationCap } from "lucide-react";
import { auth } from "@/lib/auth";
import { listMasteryCards } from "@/modules/mastery/lib/mastery-service";

type Props = {
  searchParams?: Promise<{ roadmapId?: string }>;
};

export default async function MasteryPage({ searchParams }: Props) {
  const sp = (await searchParams) ?? {};
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  const userId = session?.user?.id ?? null;
  const cards = listMasteryCards({ userId, roadmapId: sp.roadmapId ?? null });

  return (
    <section className="max-w-[980px] mx-auto space-y-4">
      <div>
        <p className="text-sm text-[var(--muted)]">Progress</p>
        <h1 className="text-[28px] font-black leading-tight mt-1">Mastery</h1>
        <p className="text-[var(--muted)]">
          Kartu pembelajaran individual. Buka kartu untuk belajar, lalu
          progression roadmap akan terbuka otomatis saat requirement terpenuhi.
        </p>
      </div>

      {cards.length === 0 ? (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
          <div className="flex items-center gap-2">
            <GraduationCap size={20} className="text-[var(--primary)]" />
            <h2 className="text-lg font-black">Belum ada kartu</h2>
          </div>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Kartu mastery akan muncul setelah roadmap memiliki learning item.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {cards.map((card) => {
            const href = card.roadmapOccurrences[0]?.masteryHref ?? `/mastery/${encodeURIComponent(card.learningItemId)}`;
            const status = card.progress?.status ?? "not_started";
            return (
              <Link
                key={card.learningItemId}
                href={href}
                className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 hover:border-[var(--primary)] transition block"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                      {card.kind}
                    </div>
                    <h2 className="mt-1 font-black text-[var(--ink)] truncate">
                      {card.title}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--muted)] line-clamp-2">
                      {card.description || "Individual learning card."}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-[var(--line)] bg-[var(--bg)] px-2.5 py-1 text-[11px] font-bold text-[var(--muted)] capitalize">
                    {status.replace("_", " ")}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-[var(--muted)]">
                  <BookOpen size={14} />
                  <span>{card.roadmapOccurrences.length} roadmap occurrence(s)</span>
                  {card.estimatedMin ? <span>· {card.estimatedMin} min</span> : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
