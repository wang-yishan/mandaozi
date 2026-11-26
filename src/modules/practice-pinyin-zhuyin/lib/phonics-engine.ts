import type { Exercise, Mastery, MatchPair } from "../types";

export function normalizeAnswer(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function checkChoice(exercise: Exercise, selected: string) {
  return (
    !!exercise.correctChoice &&
    normalizeAnswer(selected) === normalizeAnswer(exercise.correctChoice)
  );
}

export function checkMatching(exercise: Exercise, userPairs: MatchPair[]) {
  const expected = exercise.pairs ?? [];
  if (expected.length === 0 || userPairs.length !== expected.length)
    return false;
  const expectedSet = new Set(
    expected.map(
      (p) => `${normalizeAnswer(p.left)}=>${normalizeAnswer(p.right)}`,
    ),
  );
  return userPairs.every((p) =>
    expectedSet.has(`${normalizeAnswer(p.left)}=>${normalizeAnswer(p.right)}`),
  );
}

export function checkBuild(
  exercise: Exercise,
  answer: { initial: string; final: string; tone?: string },
) {
  const expected = exercise.build?.answer;
  if (!expected) return false;
  return (
    normalizeAnswer(answer.initial) === normalizeAnswer(expected.initial) &&
    normalizeAnswer(answer.final) === normalizeAnswer(expected.final) &&
    normalizeAnswer(answer.tone ?? "") === normalizeAnswer(expected.tone ?? "")
  );
}

export function isExerciseCorrect(
  exercise: Exercise,
  payload: unknown,
): boolean {
  switch (exercise.type) {
    case "recognition":
    case "audio-identification":
      return typeof payload === "string" && checkChoice(exercise, payload);
    case "matching":
      return (
        Array.isArray(payload) &&
        checkMatching(exercise, payload as MatchPair[])
      );
    case "syllable-build":
      return (
        !!payload &&
        typeof payload === "object" &&
        checkBuild(
          exercise,
          payload as { initial: string; final: string; tone?: string },
        )
      );
    case "sound-compare":
      // Sound comparison is a guided listening check; selecting any heard variant counts as completion,
      // but we also allow explicit correct choice if provided.
      if (typeof payload === "string" && exercise.correctChoice)
        return checkChoice(exercise, payload);
      return typeof payload === "string" && payload.length > 0;
    default:
      return false;
  }
}

export function scoreExercises(
  exerciseIds: string[],
  answers: Record<string, unknown>,
  exerciseMap: Record<string, Exercise>,
) {
  let correct = 0;
  const incorrectIds: string[] = [];
  for (const id of exerciseIds) {
    const ex = exerciseMap[id];
    if (!ex) continue;
    const ok = isExerciseCorrect(ex, answers[id]);
    if (ok) correct += 1;
    else incorrectIds.push(id);
  }
  const total = exerciseIds.length || 1;
  const accuracy = Math.round((correct / total) * 100);
  return { correct, total: exerciseIds.length, accuracy, incorrectIds };
}

export function masteryFromAccuracy(
  accuracy: number,
  attempts: number,
): Mastery {
  if (attempts <= 0) return "new";
  if (accuracy >= 90) return "mastered";
  if (accuracy >= 70) return "review";
  return "learning";
}

export function xpForResult(accuracy: number, baseXp: number) {
  const ratio =
    accuracy >= 90 ? 1 : accuracy >= 70 ? 0.75 : accuracy >= 40 ? 0.5 : 0.25;
  return Math.max(10, Math.round(baseXp * ratio));
}
