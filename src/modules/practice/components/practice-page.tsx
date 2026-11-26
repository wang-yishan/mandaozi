"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";

const PRACTICE_ITEMS = [
  {
    id: "practice-flashcards" as const,
    title: "Flashcards",
    desc: "Latih ingatan kosakata dengan kartu bolak-balik.",
    href: "/practice/flashcards",
  },
  {
    id: "practice-pinyin-zhuyin" as const,
    title: "Pinyin & Zhuyin",
    desc: "Pelajari bunyi Mandarin dengan Pinyin, Zhuyin, audio, dan latihan interaktif.",
    href: "/practice/pinyin-zhuyin",
  },
  {
    id: "practice-tone" as const,
    title: "Tone Recognition",
    desc: "Kenali nada Mandarin lewat kuis singkat.",
    href: "/practice/tone",
  },
  {
    id: "practice-vocab-review" as const,
    title: "Vocab Review",
    desc: "Ulangi kosakata penting agar lebih melekat.",
    href: "/practice/vocab-review",
  },
  {
    id: "practice-listening" as const,
    title: "Listening",
    desc: "Latih pendengaran Mandarin dengan audio singkat.",
    href: "/practice/listening",
  },
  {
    id: "practice-daily-challenge" as const,
    title: "Daily Challenge",
    desc: "Tantangan harian singkat untuk menjaga konsistensi.",
    href: "/practice/daily-challenge",
  },
  {
    id: "practice-weak-topics" as const,
    title: "Weak Topics",
    desc: "Fokus pada topik yang masih perlu diperkuat.",
    href: "/practice/weak-topics",
  },
];

export function PracticePage() {
  return (
    <section className="max-w-[980px] mx-auto space-y-4">
      <div>
        <h1 className="text-[28px] font-black">Practice</h1>
        <p className="text-[var(--muted)]">
          Latihan singkat, fokus, tanpa tekanan.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {PRACTICE_ITEMS.map((item) => (
          <Link key={item.id} href={item.href} className="group block min-w-0">
            <Card className="h-full p-3 sm:p-5 transition hover:border-[color:color-mix(in_srgb,var(--primary)_30%,var(--line))] hover:shadow-[0_6px_16px_rgba(32,33,36,.08)]">
              <h2 className="text-base sm:text-lg font-black leading-tight group-hover:text-[var(--primary)] transition-colors">
                {item.title}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--muted)] mt-1 line-clamp-3">
                {item.desc}
              </p>
              <span className="inline-flex items-center mt-3 sm:mt-4 min-h-[36px] sm:min-h-[44px] px-3 sm:px-4 rounded-full bg-[var(--primary)] text-white font-bold text-xs sm:text-sm">
                Buka
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
