"use client";

import { ArrowRight, BookOpen, RotateCcw, Target, Trophy } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { PageSubnav } from "@/components/layout/page-subnav";
import { Card } from "@/components/ui/card";
import { SCOPES } from "../constants";
import { usePhonicsStore } from "../store";
import type { PhonicsLesson, PhonicsScope } from "../types";
import { DisplayToggle } from "./display-toggle";

function scopeStats(
  lessons: PhonicsLesson[],
  lessonProgress: Record<
    string,
    { status: string; accuracy: number; mastery: string }
  >,
) {
  const done = lessons.filter(
    (l) => lessonProgress[l.id]?.status === "completed",
  ).length;
  const accuracy = lessons.length
    ? Math.round(
        lessons.reduce(
          (sum, l) => sum + (lessonProgress[l.id]?.accuracy ?? 0),
          0,
        ) / lessons.length,
      )
    : 0;
  const mastered = lessons.filter(
    (l) => lessonProgress[l.id]?.mastery === "mastered",
  ).length;
  return {
    total: lessons.length,
    done,
    accuracy,
    mastered,
    percent: lessons.length ? Math.round((done / lessons.length) * 100) : 0,
  };
}

export function PhonicsOverviewPage({
  lessonsByScope,
}: {
  lessonsByScope: Record<PhonicsScope, PhonicsLesson[]>;
}) {
  const lessonProgress = usePhonicsStore((s) => s.lessonProgress);
  const totalXp = usePhonicsStore((s) => s.totalXp);
  const incorrectAnswers = usePhonicsStore((s) => s.incorrectAnswers);
  const incorrect = useMemo(
    () => incorrectAnswers.filter((a) => !a.resolved),
    [incorrectAnswers],
  );

  const allLessons = [
    ...lessonsByScope.pinyin,
    ...lessonsByScope.zhuyin,
  ];
  const completed = allLessons.filter(
    (l) => lessonProgress[l.id]?.status === "completed",
  ).length;
  const avgAccuracy = allLessons.length
    ? Math.round(
        allLessons.reduce(
          (s, l) => s + (lessonProgress[l.id]?.accuracy ?? 0),
          0,
        ) / allLessons.length,
      )
    : 0;

  const continueLesson =
    allLessons.find((l) => lessonProgress[l.id]?.status !== "completed") ??
    allLessons[0];

  return (
    <section className="max-w-[1100px] mx-auto space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[30px] sm:text-[36px] font-black tracking-tight">
            Pinyin & Zhuyin
          </h1>
          <p className="text-[var(--muted)] max-w-2xl">
            Belajar bunyi Mandarin dengan dua sistem: Pinyin dan Zhuyin. Ganti
            tampilan kapan saja tanpa kehilangan progress.
          </p>
        </div>
        <DisplayToggle />
      </div>
      <PageSubnav />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-4">
          <div className="text-xs font-bold text-[var(--muted)]">Total XP</div>
          <div className="text-2xl font-black mt-1 flex items-center gap-2">
            <Trophy size={20} className="text-[var(--primary)]" /> {totalXp}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-bold text-[var(--muted)]">
            Lessons Completed
          </div>
          <div className="text-2xl font-black mt-1">
            {completed}/{allLessons.length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-bold text-[var(--muted)]">
            Average Accuracy
          </div>
          <div className="text-2xl font-black mt-1">{avgAccuracy}%</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs font-bold text-[var(--muted)]">
            Review Queue
          </div>
          <div className="text-2xl font-black mt-1">{incorrect.length}</div>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.3fr_.7fr]">
        <Card className="p-5 sm:p-6">
          <div className="text-xs font-black tracking-widest text-[var(--primary)] uppercase">
            Continue Learning
          </div>
          <h2 className="text-2xl font-black mt-2">{continueLesson.title}</h2>
          <p className="text-[var(--muted)] mt-1">{continueLesson.summary}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Link
              href={`/practice/pinyin-zhuyin/${continueLesson.scope}/${continueLesson.id}`}
              className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-full bg-[var(--primary)] text-white font-bold"
            >
              Continue <ArrowRight size={16} />
            </Link>
            <Link
              href="/practice/pinyin-zhuyin/progress"
              className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-full border border-[var(--line)] bg-[var(--surface)] font-bold"
            >
              <RotateCcw size={16} /> Review Mistakes
            </Link>
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-xs font-black tracking-widest text-[var(--muted)] uppercase">
            Quick Practice
          </div>
          <div className="mt-3 space-y-2">
            <Link
              href="/practice/pinyin-zhuyin/pinyin/py-l1"
              className="flex items-center justify-between rounded-xl border border-[var(--line)] p-3 hover:border-[var(--primary)]"
            >
              <span className="font-bold">Pinyin Initials</span>
              <ArrowRight size={16} className="text-[var(--muted)]" />
            </Link>
            <Link
              href="/practice/pinyin-zhuyin/zhuyin/zy-l1"
              className="flex items-center justify-between rounded-xl border border-[var(--line)] p-3 hover:border-[var(--primary)]"
            >
              <span className="font-bold">Zhuyin Initials</span>
              <ArrowRight size={16} className="text-[var(--muted)]" />
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {SCOPES.map((scope) => {
          const stats = scopeStats(lessonsByScope[scope.id], lessonProgress);
          return (
            <Card key={scope.id} className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-black tracking-widest text-[var(--primary)] uppercase">
                    {scope.subtitle}
                  </div>
                  <h2 className="text-2xl font-black mt-1">{scope.title}</h2>
                  <p className="text-sm text-[var(--muted)] mt-2">
                    {scope.description}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)] grid place-items-center font-black hanzi">
                  {scope.id === "pinyin" ? "拼" : "注"}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="rounded-xl bg-[var(--bg)] p-3">
                  <div className="text-[11px] text-[var(--muted)]">
                    Progress
                  </div>
                  <div className="font-black">{stats.percent}%</div>
                </div>
                <div className="rounded-xl bg-[var(--bg)] p-3">
                  <div className="text-[11px] text-[var(--muted)]">
                    Accuracy
                  </div>
                  <div className="font-black">{stats.accuracy}%</div>
                </div>
                <div className="rounded-xl bg-[var(--bg)] p-3">
                  <div className="text-[11px] text-[var(--muted)]">
                    Mastered
                  </div>
                  <div className="font-black">{stats.mastered}</div>
                </div>
              </div>
              <div className="h-2.5 bg-[var(--line)] rounded-full mt-4 overflow-hidden">
                <div
                  className="h-full bg-[var(--primary)]"
                  style={{ width: `${stats.percent}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Link
                  href={`/practice/pinyin-zhuyin/${scope.id}`}
                  className="inline-flex items-center gap-2 min-h-[42px] px-4 rounded-full bg-[var(--primary)] text-white font-bold text-sm"
                >
                  <BookOpen size={16} /> Open Scope
                </Link>
                <Link
                  href={`/practice/pinyin-zhuyin/${scope.id}/${lessonsByScope[scope.id][0]?.id}`}
                  className="inline-flex items-center gap-2 min-h-[42px] px-4 rounded-full border border-[var(--line)] bg-[var(--surface)] font-bold text-sm"
                >
                  <Target size={16} /> Start Lesson
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
