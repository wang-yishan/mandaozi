import type {
  CompetencyEvidence,
  CompetencyMastery,
  CompetencyState,
} from "./types";

export const DEFAULT_COMPETENCY_MASTERY: Omit<
  CompetencyMastery,
  "userId" | "competencyId"
> = {
  state: "not_started",
  score: 0,
  confidence: 0,
  evidenceCount: 0,
  lastEvidenceType: null,
  lastEvidenceId: null,
  lastEvidenceAt: null,
};

export function createInitialMastery(
  userId: string,
  competencyId: string,
): CompetencyMastery {
  return { userId, competencyId, ...DEFAULT_COMPETENCY_MASTERY };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function stateFromScoreAndEvidence(args: {
  previous: CompetencyState;
  score: number;
  evidence: CompetencyEvidence;
}): CompetencyState {
  const { previous, score, evidence } = args;

  if (evidence.type === "assessment_failed") {
    // Simple auto flow: failed assessment means keep learning/retry, no manual review.
    return "learning";
  }

  if (evidence.type === "assessment_passed" || evidence.passed === true) {
    return score >= 80 ? "mastered" : "learning";
  }

  // Lesson/practice completion alone must NOT grant mastery.
  if (
    evidence.type === "lesson_completed" ||
    evidence.type === "practice_completed"
  ) {
    if (previous === "mastered") return "mastered";
    return "learning";
  }

  if (evidence.type === "manual") {
    if (evidence.passed === false) return "learning";
    return previous === "not_started" ? "learning" : previous;
  }

  return previous;
}

/**
 * Apply evidence to mastery. Important rule: lesson/practice completion does NOT
 * automatically make competency mastered. Mastery comes from assessment/rubric/manual pass evidence.
 */
export function applyCompetencyEvidence(
  current: CompetencyMastery | null | undefined,
  evidence: CompetencyEvidence,
): CompetencyMastery {
  const base =
    current ?? createInitialMastery(evidence.userId, evidence.competencyId);
  const evidenceScore =
    typeof evidence.score === "number" ? clamp(evidence.score, 0, 100) : null;

  // Assessments/manual explicit scores are authoritative for that evidence.
  // Lessons/practice use a lighter moving average and cannot trigger mastery by themselves.
  const weight =
    evidence.type === "lesson_completed" ||
    evidence.type === "practice_completed"
      ? 0.2
      : 1;
  const nextScore =
    evidenceScore == null
      ? base.score
      : clamp(base.score * (1 - weight) + evidenceScore * weight, 0, 100);

  const nextConfidence = clamp(
    base.confidence +
      (evidence.type === "assessment_passed" ||
      evidence.type === "assessment_failed"
        ? 0.25
        : 0.1),
    0,
    1,
  );

  const nextState = stateFromScoreAndEvidence({
    previous: base.state,
    score: nextScore,
    evidence,
  });

  return {
    ...base,
    score: Math.round(nextScore * 100) / 100,
    confidence: Math.round(nextConfidence * 100) / 100,
    evidenceCount: base.evidenceCount + 1,
    lastEvidenceType: evidence.type,
    lastEvidenceId: evidence.sourceId ?? null,
    lastEvidenceAt: evidence.occurredAt,
    state: nextState,
    updatedAt: evidence.occurredAt,
  };
}

export function isCompetencyMastered(
  mastery: CompetencyMastery | null | undefined,
): boolean {
  return mastery?.state === "mastered";
}
