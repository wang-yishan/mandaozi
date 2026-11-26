"use client";

import { CheckCircle2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PageSubnav } from "@/components/layout/page-subnav";
import { Card } from "@/components/ui/card";
import { SCOPES } from "../constants";
import { usePhonicsStore } from "../store";
import type { PhonicsLesson, PhonicsScope } from "../types";

export function PhonicsProgressPage({
  lessonsByScope,
}: {
  lessonsByScope: Record<PhonicsScope, PhonicsLesson[]>;
}) {
  const [filter, setFilter] = useState<PhonicsScope | "all">("all");
  const lessonProgress = usePhonicsStore((s) => s.lessonProgress);
  const incorrect = usePhonicsStore((s) => s.incorrectAnswers);
  const resolve = usePhonicsStore((s) => s.resolveIncorrectAnswer);
  const clearResolved = usePhonicsStore((s) => s.clearResolvedIncorrectAnswers);
  const totalXp = usePhonicsStore((s) => s.totalXp);

  const lessons = useMemo(() => {
    const scopes: PhonicsScope[] =
      filter === "all" ? ["pinyin", "zhuyin"] : [filter];
    return scopes.flatMap((s) => lessonsByScope[s]);
  }, [filter, lessonsByScope]);

  const completed = lessons.filter(
    (l) => lessonProgress[l.id]?.status === "completed",
  ).length;
  const avgAccuracy = lessons.length
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
  const visibleIncorrect = incorrect.filter(
    (a) => filter === "all" || a.scope === filter,
  );

  return (
    <section className="max-w-[1100px] mx-auto space-y-4">
      <div>
        <h1 className="text-[30px] font-black">Phonics Progress</h1>
        <p className="text-[var(--muted)]">
          Track mastery, accuracy, and review incorrect answers for Pinyin and
          Zhuyin.
        </p>
      </div>
      <PageSubnav />

      <div className="flex flex-wrap gap-2">
        {(["all", "pinyin", "zhuyin"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`min-h-[40px] px-4 rounded-full border font-bold text-sm ${filter === f ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "bg-[var(--surface)] border-[var(--line)]"}`}
          >
            {f === "all" ? "All" : f === "pinyin" ? "Pinyin" : "Zhuyin"}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-4">
          <div className="text-xs text-[var(--muted)]">XP</div>
          <div className="text-2xl font-black">{totalXp}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-[var(--muted)]">Completed</div>
          <div className="text-2xl font-black">
            {completed}/{lessons.length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-[var(--muted)]">Avg Accuracy</div>
          <div className="text-2xl font-black">{avgAccuracy}%</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-[var(--muted)]">Mastered</div>
          <div className="text-2xl font-black">{mastered}</div>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.2fr_.8fr]">
        <Card className="p-5">
          <h2 className="text-lg font-black mb-3">Lesson mastery</h2>
          <div className="space-y-2">
            {lessons.map((lesson) => {
              const p = lessonProgress[lesson.id];
              const pct = p?.accuracy ?? 0;
              return (
                <div
                  key={lesson.id}
                  className="rounded-xl border border-[var(--line)] p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold">
                        {lesson.title}{" "}
                        <span className="text-xs text-[var(--muted)] uppercase">
                          · {lesson.scope}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--muted)]">
                        {p?.status ?? "not-started"} · mastery{" "}
                        {p?.mastery ?? "new"} · {pct}%
                      </div>
                    </div>
                    <Link
                      href={`/practice/pinyin-zhuyin/${lesson.scope}/${lesson.id}`}
                      className="text-sm font-bold text-[var(--primary)]"
                    >
                      Open
                    </Link>
                  </div>
                  <div className="h-2 bg-[var(--line)] rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-[var(--primary)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-lg font-black">Incorrect answer review</h2>
            <button
              type="button"
              onClick={clearResolved}
              className="text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)]"
            >
              Clear resolved
            </button>
          </div>
          <div className="space-y-2 max-h-[520px] overflow-auto pr-1">
            {visibleIncorrect.length === 0 && (
              <div className="text-sm text-[var(--muted)]">
                No incorrect answers yet. Great work!
              </div>
            )}
            {visibleIncorrect.map((a) => (
              <div
                key={a.id}
                className={`rounded-xl border p-3 text-sm ${a.resolved ? "border-[var(--success)] bg-[var(--success-bg)]" : "border-[var(--line)] bg-[var(--bg)]"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold">{a.prompt}</div>
                  {a.resolved ? (
                    <CheckCircle2
                      size={16}
                      className="text-[var(--success)] shrink-0"
                    />
                  ) : null}
                </div>
                <div className="text-[var(--muted)] mt-1">
                  Your:{" "}
                  <span className="text-[#B42318]">{a.userAnswer || "—"}</span>
                </div>
                <div className="text-[var(--muted)]">
                  Correct:{" "}
                  <span className="text-[var(--success)] font-semibold">
                    {a.correctAnswer}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Link
                    href={`/practice/pinyin-zhuyin/${a.scope}/${a.lessonId}/practice`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[var(--primary)]"
                  >
                    <RotateCcw size={12} /> Practice again
                  </Link>
                  {!a.resolved && (
                    <button
                      type="button"
                      onClick={() => resolve(a.id)}
                      className="text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)]"
                    >
                      Mark resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-lg font-black mb-2">Scope summary</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {SCOPES.filter((s) => filter === "all" || s.id === filter).map(
            (scope) => {
              const scopeLessons = lessonsByScope[scope.id];
              const done = scopeLessons.filter(
                (l) => lessonProgress[l.id]?.status === "completed",
              ).length;
              return (
                <div
                  key={scope.id}
                  className="rounded-xl border border-[var(--line)] p-4"
                >
                  <div className="font-black">{scope.title}</div>
                  <div className="text-sm text-[var(--muted)]">
                    {done}/{scopeLessons.length} lessons completed
                  </div>
                </div>
              );
            },
          )}
        </div>
      </Card>
    </section>
  );
}
