"use client";

import { ArrowLeft, ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import Link from "next/link";
import { PageSubnav } from "@/components/layout/page-subnav";
import { Card } from "@/components/ui/card";
import { ALL_SYMBOLS, getScope } from "../constants";
import { usePhonicsStore } from "../store";
import type { PhonicsLesson, PhonicsScope } from "../types";
import { BopomofoCards } from "./bopomofo-cards";
import { DisplayToggle } from "./display-toggle";

export function ScopePage({
  scope,
  lessons,
}: {
  scope: PhonicsScope;
  lessons: PhonicsLesson[];
}) {
  const scopeMeta = getScope(scope);
  const lessonProgress = usePhonicsStore((s) => s.lessonProgress);
  const scopeSymbols = ALL_SYMBOLS.filter((s) => s.scope === scope);

  return (
    <section className="max-w-[980px] mx-auto space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <Link
            href="/practice/pinyin-zhuyin"
            className="inline-flex items-center gap-1 text-sm font-bold text-[var(--muted)] hover:text-[var(--ink)]"
          >
            <ArrowLeft size={16} /> Pinyin & Zhuyin
          </Link>
          <h1 className="text-[30px] font-black mt-1">{scopeMeta.title}</h1>
          <p className="text-[var(--muted)]">{scopeMeta.description}</p>
        </div>
        <DisplayToggle />
      </div>
      <PageSubnav />

      <div className="grid gap-3">
        {lessons.map((lesson) => {
          const p = lessonProgress[lesson.id];
          const done = p?.status === "completed";
          return (
            <Card key={lesson.id} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)] grid place-items-center font-black shrink-0">
                  {done ? <CheckCircle2 size={22} /> : lesson.order}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-black">{lesson.title}</h2>
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-[var(--bg)] border border-[var(--line)] text-[var(--muted)]">
                      {lesson.titleId}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--muted)] mt-1">
                    {lesson.summary}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs font-bold text-[var(--muted)]">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 size={14} /> {lesson.estimatedMin} min
                    </span>
                    <span>+{lesson.xpReward} XP</span>
                    <span>
                      {p?.mastery ? `Mastery: ${p.mastery}` : "Not started"}
                    </span>
                    {p ? <span>Accuracy: {p.accuracy}%</span> : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/practice/pinyin-zhuyin/${scope}/${lesson.id}`}
                    className="inline-flex items-center gap-2 min-h-[42px] px-4 rounded-full bg-[var(--primary)] text-white font-bold text-sm"
                  >
                    {done ? "Review" : "Learn"} <ArrowRight size={16} />
                  </Link>
                  <Link
                    href={`/practice/pinyin-zhuyin/${scope}/${lesson.id}/quiz`}
                    className="inline-flex items-center gap-2 min-h-[42px] px-4 rounded-full border border-[var(--line)] bg-[var(--surface)] font-bold text-sm"
                  >
                    Quiz
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {scope === "zhuyin" && <BopomofoCards symbols={scopeSymbols} />}
    </section>
  );
}
