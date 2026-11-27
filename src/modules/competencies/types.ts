export type CompetencyState =
  | "not_started"
  | "learning"
  | "mastered"
  | "review_required";

export interface CompetencyDef {
  id: string;
  slug: string;
  title: string;
  description?: string;
  domain: string;
  levelBand?: string | null;
  active?: boolean;
}

export interface CompetencyMastery {
  userId: string;
  competencyId: string;
  state: CompetencyState;
  score: number; // 0..100
  confidence: number; // 0..1
  evidenceCount: number;
  lastEvidenceType?: string | null;
  lastEvidenceId?: string | null;
  lastEvidenceAt?: Date | null;
  updatedAt?: Date;
}

export type EvidenceType =
  | "lesson_completed"
  | "practice_completed"
  | "assessment_passed"
  | "assessment_failed"
  | "manual";

export interface CompetencyEvidence {
  userId: string;
  competencyId: string;
  type: EvidenceType;
  score?: number; // 0..100
  passed?: boolean;
  sourceId?: string;
  occurredAt: Date;
}
