"use client";

import { useRouter } from "next/navigation";
import { PageSubnav } from "@/components/layout/page-subnav";
import { Card } from "@/components/ui/card";
import { useMadaraStore } from "@/store/madara-store";
import { scoreExercises, xpForResult } from "../lib/phonics-engine";
import { buildIncorrectAnswers } from "../lib/progress";
import { usePhonicsStore } from "../store";
import type { Exercise, PhonicsLesson, PhonicsScope } from "../types";
import { ExerciseRunner } from "./exercise-runner";

export function SessionPage({
  scope,
  lesson,
  exercises,
  mode,
}: {
  scope: PhonicsScope;
  lesson: PhonicsLesson;
  exercises: Exercise[];
  mode: "practice" | "quiz";
}) {
  const router = useRouter();
  const lessonId = lesson.id;
  const record = usePhonicsStore((s) => s.recordLessonResult);
  const addXp = useMadaraStore((s) => s.addXp);

  const ids = mode === "quiz" ? lesson.quizExerciseIds : lesson.exerciseIds;
  const exerciseMap = Object.fromEntries(exercises.map((e) => [e.id, e]));

  return (
    <section className="max-w-[900px] mx-auto space-y-4">
      <div>
        <h1 className="text-[28px] font-black">
          {lesson.title} · {mode === "quiz" ? "Quiz" : "Practice"}
        </h1>
        <p className="text-[var(--muted)]">
          {mode === "quiz"
            ? "Test your understanding and earn mastery."
            : "Interactive practice with immediate feedback."}
        </p>
      </div>
      <PageSubnav />
      <Card className="p-5 sm:p-6">
        <ExerciseRunner
          exercises={exercises}
          mode={mode}
          onComplete={({ answers, answerText }) => {
            const result = scoreExercises(ids, answers, exerciseMap);
            const xp = xpForResult(
              result.accuracy,
              mode === "quiz"
                ? lesson.xpReward
                : Math.round(lesson.xpReward * 0.6),
            );
            const promptByExercise: Record<string, string> = {};
            const correctByExercise: Record<string, string> = {};
            for (const e of exercises) {
              promptByExercise[e.id] = e.prompt;
              if (e.correctChoice) correctByExercise[e.id] = e.correctChoice;
              else if (e.build)
                correctByExercise[e.id] =
                  `${e.build.answer.resultPinyin} / ${e.build.answer.resultZhuyin}`;
              else if (e.pairs)
                correctByExercise[e.id] = e.pairs
                  .map((p) => `${p.left}=>${p.right}`)
                  .join(", ");
              else if (e.compare)
                correctByExercise[e.id] =
                  `${e.compare.pinyin} / ${e.compare.zhuyin}`;
            }
            const incorrectAnswers = buildIncorrectAnswers({
              scope,
              lessonId,
              incorrectExerciseIds: result.incorrectIds,
              answerTextByExercise: answerText,
              promptByExercise,
              correctByExercise,
            });
            record({
              lessonId,
              score: result.correct,
              accuracy: result.accuracy,
              xpEarned: xp,
              incorrectExerciseIds: result.incorrectIds,
              incorrectAnswers,
            });
            addXp(xp, `phonics-${mode}`);
            const params = new URLSearchParams({
              score: String(result.correct),
              total: String(result.total),
              accuracy: String(result.accuracy),
              xp: String(xp),
              incorrect: String(result.incorrectIds.length),
              mode,
            });
            router.push(
              `/practice/pinyin-zhuyin/${scope}/${lessonId}/result?${params.toString()}`,
            );
          }}
        />
      </Card>
    </section>
  );
}
