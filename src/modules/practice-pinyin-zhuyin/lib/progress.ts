import type {
  IncorrectAnswer,
  LessonProgress,
  Mastery,
  PhonicsScope,
} from "../types";
import { masteryFromAccuracy } from "./phonics-engine";

export function createLessonProgress(): LessonProgress {
  return {
    status: "not-started",
    bestScore: 0,
    lastScore: 0,
    accuracy: 0,
    attempts: 0,
    mastery: "new",
    incorrectExerciseIds: [],
  };
}

export function updateLessonProgress(
  prev: LessonProgress | undefined,
  accuracy: number,
  score: number,
  incorrectExerciseIds: string[],
): LessonProgress {
  const base = prev ?? createLessonProgress();
  const attempts = base.attempts + 1;
  const bestScore = Math.max(base.bestScore, score);
  const lastScore = score;
  const nextAccuracy = Math.round(
    (base.accuracy * base.attempts + accuracy) / attempts,
  );
  const mastery: Mastery = masteryFromAccuracy(nextAccuracy, attempts);
  const status = accuracy >= 70 ? "completed" : "in-progress";
  return {
    status,
    bestScore,
    lastScore,
    accuracy: nextAccuracy,
    attempts,
    completedAt:
      status === "completed" ? new Date().toISOString() : base.completedAt,
    mastery,
    incorrectExerciseIds,
  };
}

export function buildIncorrectAnswers(args: {
  scope: PhonicsScope;
  lessonId: string;
  incorrectExerciseIds: string[];
  answerTextByExercise: Record<string, string>;
  promptByExercise: Record<string, string>;
  correctByExercise: Record<string, string>;
}): IncorrectAnswer[] {
  const now = new Date().toISOString();
  return args.incorrectExerciseIds.map((exerciseId) => ({
    id: `${args.lessonId}:${exerciseId}:${now}:${Math.random().toString(36).slice(2, 8)}`,
    scope: args.scope,
    lessonId: args.lessonId,
    exerciseId,
    prompt: args.promptByExercise[exerciseId] ?? exerciseId,
    correctAnswer: args.correctByExercise[exerciseId] ?? "",
    userAnswer: args.answerTextByExercise[exerciseId] ?? "",
    createdAt: now,
    resolved: false,
  }));
}
