import { createInitialMastery } from "@/modules/competencies/engine";
import type { CompetencyEvidence } from "@/modules/competencies/types";
import type {
  AssessmentAttempt,
  AssessmentDef,
  SubmitAssessmentInput,
  SubmitAssessmentResult,
} from "./types";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function normalizeAssessmentScore(score: number, maxScore: number) {
  if (maxScore <= 0) return 0;
  return clamp((score / maxScore) * 100, 0, 100);
}

export function isAssessmentPassed(
  assessment: Pick<AssessmentDef, "passScore">,
  normalizedScore: number,
) {
  return normalizedScore >= assessment.passScore;
}

export function createAttempt(args: {
  id: string;
  userId: string;
  assessmentId: string;
  roadmapId?: string | null;
  nodeId?: string | null;
  idempotencyKey?: string | null;
  now?: Date;
}): AssessmentAttempt {
  const now = args.now ?? new Date();
  return {
    id: args.id,
    userId: args.userId,
    assessmentId: args.assessmentId,
    roadmapId: args.roadmapId ?? null,
    nodeId: args.nodeId ?? null,
    score: null,
    maxScore: null,
    passed: null,
    status: "started",
    idempotencyKey: args.idempotencyKey ?? null,
    startedAt: now,
    submittedAt: null,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Server/domain-authoritative submission evaluation for auto-gradable assessments.
 * Emits competency evidence; lesson completion is NOT mastery - assessment evidence is.
 */
export function submitAssessmentAttempt(
  input: SubmitAssessmentInput,
): SubmitAssessmentResult {
  const submittedAt = input.submittedAt ?? new Date();
  const maxScore = input.maxScore ?? input.assessment.maxScore;
  const rawScore = clamp(input.score, 0, maxScore);
  const normalized = normalizeAssessmentScore(rawScore, maxScore);
  const passed = isAssessmentPassed(input.assessment, normalized);

  const attempt: AssessmentAttempt = {
    id: input.attemptId,
    userId: input.userId,
    assessmentId: input.assessment.id,
    roadmapId: input.roadmapId ?? null,
    nodeId: input.nodeId ?? null,
    score: rawScore,
    maxScore,
    passed,
    status: "graded",
    responseJson: input.responseJson,
    evaluationJson: {
      ...(typeof input.evaluationJson === "object" && input.evaluationJson
        ? (input.evaluationJson as Record<string, unknown>)
        : {}),
      normalizedScore: normalized,
      passScore: input.assessment.passScore,
    },
    idempotencyKey: input.idempotencyKey ?? null,
    startedAt: submittedAt,
    submittedAt,
    createdAt: submittedAt,
    updatedAt: submittedAt,
  };

  const evidence: CompetencyEvidence[] = (
    input.assessment.competencyIds ?? []
  ).map((competencyId) => ({
    userId: input.userId,
    competencyId,
    type: passed ? "assessment_passed" : "assessment_failed",
    score: Math.round(normalized * 100) / 100,
    passed,
    sourceId: attempt.id,
    occurredAt: submittedAt,
  }));

  // Ensure evidence references are valid for callers expecting mastery objects.
  void createInitialMastery;

  return { attempt, evidence };
}
