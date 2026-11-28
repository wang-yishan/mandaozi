import { and, eq } from "drizzle-orm";
import { submitAssessmentAttempt } from "@/modules/assessments/engine";
import type {
  AssessmentAttempt,
  AssessmentDef,
  SubmitAssessmentResult,
} from "@/modules/assessments/types";
import { db } from "../index";
import { userAssessmentAttempts } from "../schema";
import { applyAndPersistCompetencyEvidenceBatch } from "./competency-mastery.repo";

function toDomain(
  row: typeof userAssessmentAttempts.$inferSelect,
): AssessmentAttempt {
  return {
    id: row.id,
    userId: row.userId,
    assessmentId: row.assessmentId,
    roadmapId: row.roadmapId,
    nodeId: row.nodeId,
    score: row.score,
    maxScore: row.maxScore,
    passed: row.passed,
    status: row.status as AssessmentAttempt["status"],
    responseJson: row.responseJson,
    evaluationJson: row.evaluationJson,
    idempotencyKey: row.idempotencyKey,
    startedAt: row.startedAt,
    submittedAt: row.submittedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getAssessmentAttemptById(
  id: string,
): Promise<AssessmentAttempt | null> {
  const row = await db
    .select()
    .from(userAssessmentAttempts)
    .where(eq(userAssessmentAttempts.id, id))
    .get();
  return row ? toDomain(row) : null;
}

export async function getAssessmentAttemptByIdempotency(args: {
  userId: string;
  assessmentId: string;
  idempotencyKey: string;
}): Promise<AssessmentAttempt | null> {
  const row = await db
    .select()
    .from(userAssessmentAttempts)
    .where(
      and(
        eq(userAssessmentAttempts.userId, args.userId),
        eq(userAssessmentAttempts.assessmentId, args.assessmentId),
        eq(userAssessmentAttempts.idempotencyKey, args.idempotencyKey),
      ),
    )
    .get();
  return row ? toDomain(row) : null;
}

export async function listUserAssessmentAttempts(args: {
  userId: string;
  roadmapId?: string;
  nodeId?: string;
  limit?: number;
}): Promise<AssessmentAttempt[]> {
  const conditions = [eq(userAssessmentAttempts.userId, args.userId)];
  if (args.roadmapId)
    conditions.push(eq(userAssessmentAttempts.roadmapId, args.roadmapId));
  if (args.nodeId) conditions.push(eq(userAssessmentAttempts.nodeId, args.nodeId));
  const rows = await db
    .select()
    .from(userAssessmentAttempts)
    .where(and(...conditions))
    .all();
  return rows.map(toDomain).slice(0, args.limit ?? 50);
}

export async function submitAndPersistAssessmentAttempt(args: {
  attemptId: string;
  userId: string;
  assessment: AssessmentDef;
  roadmapId?: string | null;
  nodeId?: string | null;
  score: number;
  maxScore?: number;
  responseJson?: unknown;
  evaluationJson?: unknown;
  idempotencyKey?: string | null;
  submittedAt?: Date;
}): Promise<SubmitAssessmentResult & { idempotentReplay: boolean }> {
  const submittedAt = args.submittedAt ?? new Date();

  if (args.idempotencyKey) {
    const existing = await getAssessmentAttemptByIdempotency({
      userId: args.userId,
      assessmentId: args.assessment.id,
      idempotencyKey: args.idempotencyKey,
    });
    if (existing) {
      return {
        attempt: existing,
        evidence: [],
        idempotentReplay: true,
      };
    }
  }

  const result = submitAssessmentAttempt({
    attemptId: args.attemptId,
    userId: args.userId,
    assessment: args.assessment,
    roadmapId: args.roadmapId,
    nodeId: args.nodeId,
    score: args.score,
    maxScore: args.maxScore,
    responseJson: args.responseJson,
    evaluationJson: args.evaluationJson,
    idempotencyKey: args.idempotencyKey,
    submittedAt,
  });

  await db.transaction(async (tx: any) => {
    await tx
      .insert(userAssessmentAttempts)
      .values({
        id: result.attempt.id,
        userId: result.attempt.userId,
        assessmentId: result.attempt.assessmentId,
        roadmapId: result.attempt.roadmapId ?? null,
        nodeId: result.attempt.nodeId ?? null,
        score: result.attempt.score ?? null,
        maxScore: result.attempt.maxScore ?? null,
        passed: result.attempt.passed ?? null,
        status: result.attempt.status,
        responseJson: result.attempt.responseJson ?? null,
        evaluationJson: result.attempt.evaluationJson ?? null,
        idempotencyKey: result.attempt.idempotencyKey ?? null,
        startedAt: result.attempt.startedAt ?? submittedAt,
        submittedAt: result.attempt.submittedAt ?? submittedAt,
        createdAt: result.attempt.createdAt,
        updatedAt: result.attempt.updatedAt,
      })
      .run();
  });

  // Persist emitted competency evidence (lesson completion != mastery; assessment evidence does).
  await applyAndPersistCompetencyEvidenceBatch(result.evidence);

  return { ...result, idempotentReplay: false };
}
