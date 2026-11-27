import { and, eq } from "drizzle-orm";
import { applyCompetencyEvidence } from "@/modules/competencies/engine";
import type {
  CompetencyEvidence,
  CompetencyMastery,
} from "@/modules/competencies/types";
import { db } from "../index";
import { userCompetencyMastery } from "../schema";

function toDomain(
  row: typeof userCompetencyMastery.$inferSelect,
): CompetencyMastery {
  return {
    userId: row.userId,
    competencyId: row.competencyId,
    state: row.state as CompetencyMastery["state"],
    score: row.score,
    confidence: row.confidence,
    evidenceCount: row.evidenceCount,
    lastEvidenceType: row.lastEvidenceType,
    lastEvidenceId: row.lastEvidenceId,
    lastEvidenceAt: row.lastEvidenceAt,
    updatedAt: row.updatedAt,
  };
}

export function getUserCompetencyMastery(
  userId: string,
  competencyId: string,
): CompetencyMastery | null {
  const row = db
    .select()
    .from(userCompetencyMastery)
    .where(
      and(
        eq(userCompetencyMastery.userId, userId),
        eq(userCompetencyMastery.competencyId, competencyId),
      ),
    )
    .get();
  return row ? toDomain(row) : null;
}

export function listUserCompetencyMastery(userId: string): CompetencyMastery[] {
  return db
    .select()
    .from(userCompetencyMastery)
    .where(eq(userCompetencyMastery.userId, userId))
    .all()
    .map(toDomain);
}

export function applyAndPersistCompetencyEvidence(
  evidence: CompetencyEvidence,
): CompetencyMastery {
  const now = evidence.occurredAt;
  return db.transaction((tx) => {
    const currentRow = tx
      .select()
      .from(userCompetencyMastery)
      .where(
        and(
          eq(userCompetencyMastery.userId, evidence.userId),
          eq(userCompetencyMastery.competencyId, evidence.competencyId),
        ),
      )
      .get();
    const current = currentRow ? toDomain(currentRow) : null;
    const next = applyCompetencyEvidence(current, evidence);

    tx.insert(userCompetencyMastery)
      .values({
        userId: next.userId,
        competencyId: next.competencyId,
        state: next.state,
        score: next.score,
        confidence: next.confidence,
        evidenceCount: next.evidenceCount,
        lastEvidenceType: next.lastEvidenceType ?? null,
        lastEvidenceId: next.lastEvidenceId ?? null,
        lastEvidenceAt: next.lastEvidenceAt ?? null,
        updatedAt: next.updatedAt ?? now,
      })
      .onConflictDoUpdate({
        target: [
          userCompetencyMastery.userId,
          userCompetencyMastery.competencyId,
        ],
        set: {
          state: next.state,
          score: next.score,
          confidence: next.confidence,
          evidenceCount: next.evidenceCount,
          lastEvidenceType: next.lastEvidenceType ?? null,
          lastEvidenceId: next.lastEvidenceId ?? null,
          lastEvidenceAt: next.lastEvidenceAt ?? null,
          updatedAt: next.updatedAt ?? now,
        },
      })
      .run();

    return next;
  });
}

export function applyAndPersistCompetencyEvidenceBatch(
  evidences: CompetencyEvidence[],
): CompetencyMastery[] {
  return evidences.map((e) => applyAndPersistCompetencyEvidence(e));
}
