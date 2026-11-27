"use server";

import { headers } from "next/headers";
import { z } from "zod";
import {
  listUserAssessmentAttempts,
  submitAndPersistAssessmentAttempt,
} from "@/db/repositories/assessment-attempts.repo";
import { auth } from "@/lib/auth";

const submitAssessmentSchema = z.object({
  attemptId: z.string().min(1),
  assessment: z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    kind: z.enum(["quiz", "oral", "written", "project", "rubric"]),
    mode: z.enum(["auto", "manual", "hybrid"]),
    maxScore: z.number().int().positive(),
    passScore: z.number().int().min(0),
    competencyIds: z.array(z.string().min(1)).optional(),
    active: z.boolean().optional(),
  }),
  roadmapId: z.string().min(1).nullable().optional(),
  nodeId: z.string().min(1).nullable().optional(),
  score: z.number().int().min(0),
  maxScore: z.number().int().positive().optional(),
  responseJson: z.unknown().optional(),
  evaluationJson: z.unknown().optional(),
  idempotencyKey: z.string().min(1).nullable().optional(),
});

async function requireUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");
  return session.user.id;
}

export async function submitAssessmentAttemptAction(
  input: z.input<typeof submitAssessmentSchema>,
) {
  const userId = await requireUserId();
  const parsed = submitAssessmentSchema.parse(input);
  const result = submitAndPersistAssessmentAttempt({
    attemptId: parsed.attemptId,
    userId,
    assessment: {
      ...parsed.assessment,
      competencyIds: parsed.assessment.competencyIds ?? [],
    },
    roadmapId: parsed.roadmapId ?? null,
    nodeId: parsed.nodeId ?? null,
    score: parsed.score,
    maxScore: parsed.maxScore,
    responseJson: parsed.responseJson,
    evaluationJson: parsed.evaluationJson,
    idempotencyKey: parsed.idempotencyKey ?? null,
  });

  return {
    ok: true as const,
    idempotentReplay: result.idempotentReplay,
    attempt: {
      id: result.attempt.id,
      status: result.attempt.status,
      passed: result.attempt.passed,
      score: result.attempt.score,
      maxScore: result.attempt.maxScore,
    },
    evidenceCount: result.evidence.length,
  };
}

const listAttemptsSchema = z.object({
  roadmapId: z.string().min(1).optional(),
  nodeId: z.string().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export async function listAssessmentAttemptsAction(
  input: z.input<typeof listAttemptsSchema> = {},
) {
  const userId = await requireUserId();
  const parsed = listAttemptsSchema.parse(input);
  const attempts = listUserAssessmentAttempts({
    userId,
    roadmapId: parsed.roadmapId,
    nodeId: parsed.nodeId,
    limit: parsed.limit,
  });
  return {
    attempts: attempts.map((a) => ({
      id: a.id,
      assessmentId: a.assessmentId,
      roadmapId: a.roadmapId,
      nodeId: a.nodeId,
      status: a.status,
      score: a.score,
      maxScore: a.maxScore,
      passed: a.passed,
      submittedAt: a.submittedAt,
    })),
  };
}
