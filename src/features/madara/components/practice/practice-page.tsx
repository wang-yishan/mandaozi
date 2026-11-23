"use client";

import { useMadaraStore } from "../../store/madara-store";
import { PageSubnav } from "../shell/page-subnav";
import { Card } from "../ui/card";

const PRACTICE_ITEMS = [
  {
    id: "practice-flashcards" as const,
    title: "Flashcards",
    desc: "Latih ingatan kosakata dengan kartu bolak-balik.",
  },
  {
    id: "practice-tone" as const,
    title: "Tone Recognition",
    desc: "Kenali nada Mandarin lewat kuis singkat.",
  },
  {
    id: "practice-vocab-review" as const,
    title: "Vocab Review",
    desc: "Ulangi kosakata penting agar lebih melekat.",
  },
  {
    id: "practice-listening" as const,
    title: "Listening",
    desc: "Latih pendengaran Mandarin dengan audio singkat.",
  },
  {
    id: "practice-daily-challenge" as const,
    title: "Daily Challenge",
    desc: "Tantangan harian singkat untuk menjaga konsistensi.",
  },
  {
    id: "practice-weak-topics" as const,
    title: "Weak Topics",
    desc: "Fokus pada topik yang masih perlu diperkuat.",
  },
];

export function PracticePage() {
  const setPage = useMadaraStore((s) => s.setPage);
  return (
    <section className="max-w-[980px] mx-auto space-y-4">
      <div>
        <h1 className="text-[28px] font-black">Practice</h1>
        <p className="text-[var(--muted)]">
          Latihan singkat, fokus, tanpa tekanan.
        </p>
      </div>
      <PageSubnav />
      <div className="grid sm:grid-cols-2 gap-3">
        {PRACTICE_ITEMS.map((item) => (
          <Card key={item.id} className="p-5">
            <h2 className="text-lg font-black">{item.title}</h2>
            <p className="text-sm text-[var(--muted)] mt-1">{item.desc}</p>
            <button
              type="button"
              onClick={() => setPage(item.id)}
              className="mt-4 min-h-[44px] px-4 rounded-full bg-[var(--primary)] text-white font-bold text-sm"
            >
              Buka {item.title}
            </button>
          </Card>
        ))}
      </div>
    </section>
  );
}
