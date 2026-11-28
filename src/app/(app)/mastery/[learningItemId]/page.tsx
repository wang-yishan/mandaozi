export const instant = false;

import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { getMasteryCardDetail, isSafeSourceHref } from "@/modules/mastery/lib/mastery-service";
import { MasteryCompleteButton } from "@/modules/mastery/components/mastery-complete-button";

type Props = {
  params: Promise<{ learningItemId: string }>;
  searchParams?: Promise<{
    roadmapId?: string;
    nodeId?: string;
    choiceNodeId?: string;
    choiceId?: string;
    returnTo?: string;
  }>;
};

export default async function MasteryDetailPage({ params, searchParams }: Props) {
  const { learningItemId: rawId } = await params;
  const sp = (await searchParams) ?? {};
  const learningItemId = decodeURIComponent(rawId);
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  const userId = session?.user?.id ?? null;

  const detail = getMasteryCardDetail({
    learningItemId,
    userId,
    roadmapId: sp.roadmapId ?? null,
    nodeId: sp.nodeId ?? null,
  });
  if (!detail) notFound();

  const { card, nodeVm } = detail;
  const returnTo =
    typeof sp.returnTo === "string" && sp.returnTo.startsWith("/")
      ? sp.returnTo
      : sp.roadmapId
        ? "/roadmaps"
        : "/mastery";
  const sourceHref = isSafeSourceHref(card.sourceHref) ? card.sourceHref : undefined;
  const canComplete = nodeVm ? nodeVm.canComplete : true;
  const isLocked = nodeVm ? nodeVm.status === "locked" : false;
  const status = nodeVm?.status ?? card.progress?.status ?? "not_started";

  return (
    <section className="max-w-[980px] mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Link
          href={returnTo}
          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--muted)] hover:text-[var(--ink)]"
        >
          <ArrowLeft size={16} /> Back
        </Link>
      </div>

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 space-y-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
            {card.kind} · Individual mastery card
          </div>
          <h1 className="mt-2 text-2xl font-black text-[var(--ink)]">{card.title}</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">{card.description}</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-3 py-1.5 text-[var(--muted)] capitalize">
            Status: {String(status).replace(/[-_]/g, " ")}
          </span>
          {nodeVm?.estimatedDuration ? (
            <span className="rounded-full border border-[var(--line)] bg-[var(--bg)] px-3 py-1.5 text-[var(--muted)]">
              {nodeVm.estimatedDuration}
            </span>
          ) : null}
        </div>

        {isLocked ? (
          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4 text-sm text-[var(--muted)]">
            <div className="flex items-center gap-2 font-bold text-[var(--ink)]">
              <Lock size={16} /> Locked by roadmap prerequisites
            </div>
            <p className="mt-2">
              Selesaikan prerequisite di roadmap terlebih dahulu. Kartu ini tetap bisa dilihat, tapi tidak bisa diselesaikan sebelum requirement terpenuhi.
            </p>
          </div>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row">
          {sourceHref ? (
            <Link
              href={sourceHref}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[14px] bg-[var(--primary)] px-4 font-bold text-white"
            >
              <BookOpen size={16} /> Open Source Learning
              <ArrowUpRight size={16} />
            </Link>
          ) : (
            <div className="inline-flex min-h-[48px] items-center justify-center rounded-[14px] border border-[var(--line)] bg-[var(--bg)] px-4 text-sm font-bold text-[var(--muted)]">
              No external source — use this card as the learning unit.
            </div>
          )}
          <MasteryCompleteButton
            learningItemId={card.learningItemId}
            roadmapId={sp.roadmapId ?? card.roadmapContext?.roadmapId ?? null}
            nodeId={sp.nodeId ?? card.roadmapContext?.nodeId ?? null}
            disabled={isLocked || !canComplete}
            completed={status === "completed" || status === "mastered"}
            returnTo={returnTo}
          />
        </div>
      </div>

      {card.roadmapContext ? (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
          <h2 className="text-lg font-black">Roadmap context</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {card.roadmapContext.roadmapTitle} · {card.roadmapContext.nodeTitle}
          </p>
          <div className="mt-4 space-y-2">
            <div className="text-sm font-bold">Prerequisites</div>
            {card.roadmapContext.prerequisites.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No prerequisites. Starting point.</p>
            ) : (
              <ul className="space-y-2">
                {card.roadmapContext.prerequisites.map((p) => (
                  <li key={p.id} className="flex items-center gap-2 text-sm">
                    {p.completed ? (
                      <CheckCircle2 size={16} className="text-[var(--success)]" />
                    ) : (
                      <Lock size={16} className="text-[var(--muted)]" />
                    )}
                    <span className={p.completed ? "text-[var(--ink)]" : "text-[var(--muted)]"}>{p.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
          <h2 className="text-lg font-black">Roadmap context</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            This card is an individual learning item. Prerequisites depend on which roadmap uses it.
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
        <h2 className="text-lg font-black">Roadmap occurrences</h2>
        {card.roadmapOccurrences.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted)]">No roadmap occurrence found.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {card.roadmapOccurrences.map((o) => (
              <li key={`${o.roadmapId}:${o.nodeId}`} className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 text-sm">
                <div className="font-bold text-[var(--ink)]">{o.roadmapTitle}</div>
                <div className="text-[var(--muted)]">{o.nodeTitle}</div>
                <Link href={o.masteryHref} className="mt-2 inline-flex text-xs font-bold text-[var(--primary)]">
                  Open in roadmap context
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
