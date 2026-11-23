"use client";

import { useState } from "react";
import { VOCAB } from "../../data/vocab";
import { useMadaraStore } from "../../store/madara-store";
import { PageSubnav } from "../shell/page-subnav";
import { Card } from "../ui/card";

export function FlashcardsContent() {
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const addXp = useMadaraStore((s) => s.addXp);
  const showToast = useMadaraStore((s) => s.showToast);
  const w = VOCAB[i % VOCAB.length];
  return (
    <Card className="p-5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-black tracking-widest text-[var(--primary)]">
          FLASHCARDS
        </span>
        <span className="text-sm text-[var(--muted)]">
          {(i % VOCAB.length) + 1}/{VOCAB.length}
        </span>
      </div>
      <button
        type="button"
        onClick={() => setFlip((f) => !f)}
        className="w-full mt-4 min-h-[180px] rounded-2xl bg-[var(--primary-soft)] grid place-items-center p-6 text-center"
      >
        {!flip ? (
          <div className="hanzi text-6xl font-black">{w.hanzi}</div>
        ) : (
          <div>
            <div className="text-2xl font-black">{w.pinyin}</div>
            <div className="text-lg mt-1">
              {w.en} · {w.id}
            </div>
            <div className="text-sm text-[var(--muted)] mt-2">
              Ketuk untuk lihat Hanzi
            </div>
          </div>
        )}
      </button>
      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={() => {
            setI(i + 1);
            setFlip(false);
          }}
          className="flex-1 min-h-[48px] rounded-full border border-[var(--line)] font-bold"
        >
          Masih belajar
        </button>
        <button
          type="button"
          onClick={() => {
            setI(i + 1);
            setFlip(false);
            addXp(5);
            showToast("+5 XP · Kartu dikuasai");
          }}
          className="flex-1 min-h-[48px] rounded-full bg-[var(--primary)] text-white font-bold"
        >
          Saya tahu ✓
        </button>
      </div>
    </Card>
  );
}

export function FlashcardsPage() {
  return (
    <section className="max-w-[980px] mx-auto space-y-4">
      <div>
        <h1 className="text-[28px] font-black">Flashcards</h1>
        <p className="text-[var(--muted)]">
          Latih ingatan kosakata dengan kartu bolak-balik.
        </p>
      </div>
      <PageSubnav />
      <FlashcardsContent />
    </section>
  );
}
