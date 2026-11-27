import type { CompetencyEvidence } from "@/modules/competencies/types";

export type AssessmentKind = "quiz" | "oral" | "written" | "project" | "rubric";
export type AssessmentMode = "auto" | "manual" | "hybrid";
export type AttemptStatus = "started" | "submitted" | "graded" | "invalid";

export interface AssessmentDef {
  id: string;
  title: string;
  kind: AssessmentKind;
  mode: AssessmentMode;
  maxScore: number;
  passScore: number;
  competencyIds?: string[];
  active?: boolean;
}

export interface AssessmentAttempt {
  id: string;
  userId: string;
  assessmentId: string;
  roadmapId?: string | null;
  nodeId?: string | null;
  score?: number | null;
  maxScore?: number | null;
  passed?: boolean | null;
  status: AttemptStatus;
  responseJson?: unknown;
  evaluationJson?: unknown;
  idempotencyKey?: string | null;
  startedAt?: Date | null;
  submittedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubmitAssessmentInput {
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
}

export interface SubmitAssessmentResult {
  attempt: AssessmentAttempt;
  evidence: CompetencyEvidence[];
}
