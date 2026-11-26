"use client";

import { ArrowRight, RotateCcw, Trophy } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { PageSubnav } from "@/components/layout/page-subnav";
import { Card } from "@/components/ui/card";
import { usePhonicsStore } from "../store";
import type { PhonicsLesson, PhonicsScope } from "../types";

export function ResultPage({
  scope,
  lesson,
  lessons,
}: {
  scope: PhonicsScope;
  lesson: PhonicsLesson;
  lessons: PhonicsLesson[];
}) {
  const sp = useSearchParams();
  const lessonId = lesson.id;
  const progress = usePhonicsStore((s) => s.lessonProgress[lessonId]);
  const incorrectAnswers = usePhonicsStore((s) => s.incorrectAnswers);
  const incorrect = useMemo(
    () =>
      incorrectAnswers.filter((a) => a.lessonId === lessonId && !a.resolved),
    [incorrectAnswers, lessonId],
  );

  const score = Number(sp.get("score") ?? progress?.lastScore ?? 0);
  const total = Number(sp.get("total") ?? lesson.quizExerciseIds.length);
  const accuracy = Number(sp.get("accuracy") ?? progress?.accuracy ?? 0);
  const xp = Number(sp.get("xp") ?? 0);
  const mode = sp.get("mode") ?? "quiz";
  const incorrectCount = Number(sp.get("incorrect") ?? incorrect.length);

  const idx = lessons.findIndex((l) => l.id === lessonId);
  const next = lessons[idx + 1];

  return (
    <section className="max-w-[900px] mx-auto space-y-4">
      <div>
        <h1 className="text-[28px] font-black">Lesson Result</h1>
        <p className="text-[var(--muted)]">
          {lesson.title} · {mode === "quiz" ? "Quiz" : "Practice"}
        </p>
      </div>
      <PageSubnav />

      <Card className="p-6 sm:p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] mb-4">
          <Trophy size={30} />
        </div>
        <h2 className="text-3xl font-black">
          {score}/{total}
        </h2>
        <p className="text-[var(--muted)] mt-1">Correct answers</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 text-left">
          <div className="rounded-xl bg-[var(--bg)] p-4">
            <div className="text-xs text-[var(--muted)]">Accuracy</div>
            <div className="text-xl font-black">{accuracy}%</div>
          </div>
          <div className="rounded-xl bg-[var(--bg)] p-4">
            <div className="text-xs text-[var(--muted)]">XP Earned</div>
            <div className="text-xl font-black">+{xp}</div>
          </div>
          <div className="rounded-xl bg-[var(--bg)] p-4">
            <div className="text-xs text-[var(--muted)]">Mastery</div>
            <div className="text-xl font-black capitalize">
              {progress?.mastery ?? "learning"}
            </div>
          </div>
          <div className="rounded-xl bg-[var(--bg)] p-4">
            <div className="text-xs text-[var(--muted)]">To Review</div>
            <div className="text-xl font-black">{incorrectCount}</div>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          <Link
            href={`/practice/pinyin-zhuyin/${scope}/${lessonId}/practice`}
            className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-full border border-[var(--line)] bg-[var(--surface)] font-bold"
          >
            <RotateCcw size={16} /> Practice Again
          </Link>
          <Link
            href="/practice/pinyin-zhuyin/progress"
            className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-full border border-[var(--line)] bg-[var(--surface)] font-bold"
          >
            Review Incorrect
          </Link>
          {next ? (
            <Link
              href={`/practice/pinyin-zhuyin/${scope}/${next.id}`}
              className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-full bg-[var(--primary)] text-white font-bold"
            >
              Next Lesson <ArrowRight size={16} />
            </Link>
          ) : (
            <Link
              href={`/practice/pinyin-zhuyin/${scope}`}
              className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-full bg-[var(--primary)] text-white font-bold"
            >
              Back to Scope <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </Card>

      {incorrect.length > 0 && (
        <Card className="p-5">
          <h3 className="font-black text-lg">Incorrect answers to review</h3>
          <div className="mt-3 space-y-2">
            {incorrect.slice(0, 8).map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3 text-sm"
              >
                <div className="font-bold">{a.prompt}</div>
                <div className="text-[var(--muted)] mt-1">
                  Your answer:{" "}
                  <span className="text-[#B42318]">{a.userAnswer || "—"}</span>
                </div>
                <div className="text-[var(--muted)]">
                  Correct:{" "}
                  <span className="text-[var(--success)] font-semibold">
                    {a.correctAnswer}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </section>
  );
}
