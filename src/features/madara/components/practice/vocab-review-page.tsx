"use client";

import { VOCAB } from "../../data/vocab";
import { useMadaraStore } from "../../store/madara-store";
import { PageSubnav } from "../shell/page-subnav";
import { Card } from "../ui/card";

export function VocabReviewContent() {
  const favorites = useMadaraStore((s) => s.favorites);
  const setPage = useMadaraStore((s) => s.setPage);
  const words = VOCAB.filter((w) => favorites.includes(w.hanzi)).slice(0, 6);
  const list = words.length ? words : VOCAB.slice(0, 4);
  return (
    <Card className="p-5">
      <span className="text-xs font-black tracking-widest text-[var(--primary)]">
        VOCAB REVIEW
      </span>
      <p className="text-sm text-[var(--muted)] mt-1">
        Kata yang perlu diulang · Spaced repetition ringan
      </p>
      <div className="grid gap-2 mt-4">
        {list.map((w) => (
          <div
            key={w.hanzi}
            className="flex justify-between items-center bg-[var(--bg)] rounded-xl px-4 py-3"
          >
            <div>
              <span className="hanzi text-xl font-bold">{w.hanzi}</span>{" "}
              <span className="text-sm text-[var(--muted)]">{w.pinyin}</span>
            </div>
            <div className="text-sm font-bold">{w.en}</div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setPage("dictionary-all")}
        className="mt-4 min-h-[44px] px-4 rounded-full border border-[var(--line)] font-bold"
      >
        Buka Dictionary
      </button>
    </Card>
  );
}

export function VocabReviewPage() {
  return (
    <section className="max-w-[980px] mx-auto space-y-4">
      <div>
        <h1 className="text-[28px] font-black">Vocab Review</h1>
        <p className="text-[var(--muted)]">
          Ulangi kosakata penting agar lebih melekat.
        </p>
      </div>
      <PageSubnav />
      <VocabReviewContent />
    </section>
  );
}
