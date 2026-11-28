import { and, eq, inArray } from "drizzle-orm";
import { progressionRuleSchema } from "@/modules/progression/rule-schema";
import type { RoadmapProgressionInput } from "@/modules/roadmaps/utils/roadmap-progression-adapter";
import { db } from "../index";
import {
  assessments,
  competencies,
  learningItems,
  roadmapNodeAssessments,
  roadmapNodeCompetencies,
  roadmapNodeResources,
  roadmapNodeRules,
  userAssessmentAttempts,
  userCompetencyMastery,
  userRoadmapBranchChoices,
} from "../schema";

export interface RoadmapProgressionContext extends RoadmapProgressionInput {
  primaryLearningItemByNodeId: Record<
    string,
    {
      learningItemId: string;
      title: string;
      kind: string;
      sourceType: string;
      sourceRef: string;
    }
  >;
  nodeCompetenciesByNodeId: Record<
    string,
    Array<{ id: string; title: string }>
  >;
  nodeResourcesByNodeId: Record<
    string,
    Array<{
      id: string;
      title: string;
      kind: string;
      href?: string;
      role: "learn" | "practice" | "review" | "assessment";
    }>
  >;
  nodeAssessmentsByNodeId: Record<
    string,
    Array<{
      id: string;
      title: string;
      kind: string;
      passed?: boolean | null;
      lastScore?: number | null;
      maxScore?: number | null;
    }>
  >;
}

export function loadRoadmapProgressionContext(args: {
  userId: string;
  roadmapId: string;
  nodeIds: string[];
}): RoadmapProgressionContext {
  const { userId, roadmapId, nodeIds } = args;
  if (nodeIds.length === 0) {
    return {
      branchChoices: {},
      primaryLearningItemByNodeId: {},
      nodeCompetenciesByNodeId: {},
      nodeResourcesByNodeId: {},
      nodeAssessmentsByNodeId: {},
    };
  }

  const rules = db
    .select()
    .from(roadmapNodeRules)
    .where(
      and(
        eq(roadmapNodeRules.roadmapId, roadmapId),
        eq(roadmapNodeRules.active, true),
      ),
    )
    .all();

  const unlockRulesByNodeId: NonNullable<
    RoadmapProgressionInput["unlockRulesByNodeId"]
  > = {};
  for (const r of rules) {
    if (r.ruleType !== "unlock") continue;
    const parsed = progressionRuleSchema.safeParse(r.ruleJson);
    if (parsed.success) unlockRulesByNodeId[r.nodeId] = parsed.data;
  }

  const choices = db
    .select()
    .from(userRoadmapBranchChoices)
    .where(
      and(
        eq(userRoadmapBranchChoices.userId, userId),
        eq(userRoadmapBranchChoices.roadmapId, roadmapId),
      ),
    )
    .all();
  const branchChoices: Record<string, string> = {};
  for (const c of choices) branchChoices[c.choiceNodeId] = c.choiceId;

  const masteryRows = db
    .select()
    .from(userCompetencyMastery)
    .where(eq(userCompetencyMastery.userId, userId))
    .all();
  const competencyMasteredIds = masteryRows
    .filter((m: any) => m.state === "mastered")
    .map((m: any) => m.competencyId);
  const competencyScores: Record<string, number> = {};
  for (const m of masteryRows) competencyScores[m.competencyId] = m.score;

  const attemptRows = db
    .select()
    .from(userAssessmentAttempts)
    .where(eq(userAssessmentAttempts.userId, userId))
    .all();
  const passedAssessmentIds = Array.from(
    new Set(
      attemptRows.filter((a: any) => a.passed === true).map((a: any) => a.assessmentId),
    ),
  ) as string[];
  const assessmentScores: Record<string, number> = {};
  for (const a of attemptRows) {
    if (typeof a.score === "number") {
      const prev = assessmentScores[a.assessmentId];
      assessmentScores[a.assessmentId] =
        prev === undefined ? a.score : Math.max(prev, a.score);
    }
  }

  const nodeResources = db
    .select({
      nodeId: roadmapNodeResources.nodeId,
      role: roadmapNodeResources.role,
      sortOrder: roadmapNodeResources.sortOrder,
      isPrimary: roadmapNodeResources.isPrimary,
      itemId: learningItems.id,
      title: learningItems.title,
      kind: learningItems.kind,
      sourceType: learningItems.sourceType,
      sourceRef: learningItems.sourceRef,
    })
    .from(roadmapNodeResources)
    .innerJoin(
      learningItems,
      eq(roadmapNodeResources.learningItemId, learningItems.id),
    )
    .where(inArray(roadmapNodeResources.nodeId, nodeIds))
    .all();
  const nodeResourcesByNodeId: RoadmapProgressionContext["nodeResourcesByNodeId"] =
    {};
  const primaryLearningItemByNodeId: RoadmapProgressionContext["primaryLearningItemByNodeId"] =
    {};
  for (const r of nodeResources) {
    const list = nodeResourcesByNodeId[r.nodeId] ?? [];
    list.push({
      id: r.itemId,
      title: r.title,
      kind: r.kind,
      href: r.sourceRef.startsWith("/") ? r.sourceRef : undefined,
      role: r.role as "learn" | "practice" | "review" | "assessment",
    });
    nodeResourcesByNodeId[r.nodeId] = list;

    if (r.isPrimary) {
      primaryLearningItemByNodeId[r.nodeId] = {
        learningItemId: r.itemId,
        title: r.title,
        kind: r.kind,
        sourceType: r.sourceType,
        sourceRef: r.sourceRef,
      };
    }
  }
  // Fallback: if no isPrimary flag (pre-backfill/migration edge), pick best resource.
  for (const nodeId of nodeIds) {
    if (primaryLearningItemByNodeId[nodeId]) continue;
    const candidates = nodeResources
      .filter((r: any) => r.nodeId === nodeId)
      .slice()
      .sort((a: any, b: any) => {
        const aLearn = a.role === "learn" ? 0 : 1;
        const bLearn = b.role === "learn" ? 0 : 1;
        if (aLearn !== bLearn) return aLearn - bLearn;
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.itemId.localeCompare(b.itemId);
      });
    const c = candidates[0];
    if (c) {
      primaryLearningItemByNodeId[nodeId] = {
        learningItemId: c.itemId,
        title: c.title,
        kind: c.kind,
        sourceType: c.sourceType,
        sourceRef: c.sourceRef,
      };
    }
  }

  const nodeAssessments = db
    .select({
      nodeId: roadmapNodeAssessments.nodeId,
      assessmentId: roadmapNodeAssessments.assessmentId,
      assessmentTitle: assessments.title,
      assessmentKind: assessments.kind,
      maxScore: assessments.maxScore,
    })
    .from(roadmapNodeAssessments)
    .innerJoin(
      assessments,
      eq(roadmapNodeAssessments.assessmentId, assessments.id),
    )
    .where(inArray(roadmapNodeAssessments.nodeId, nodeIds))
    .all();
  const nodeAssessmentsByNodeId: RoadmapProgressionContext["nodeAssessmentsByNodeId"] =
    {};
  for (const a of nodeAssessments) {
    const list = nodeAssessmentsByNodeId[a.nodeId] ?? [];
    const best = attemptRows
      .filter((att: any) => att.assessmentId === a.assessmentId)
      .sort((x: any, y: any) => (y.score ?? -1) - (x.score ?? -1))[0];
    list.push({
      id: a.assessmentId,
      title: a.assessmentTitle,
      kind: a.assessmentKind,
      passed: best ? (best.passed ?? null) : null,
      lastScore: best?.score ?? null,
      maxScore: best?.maxScore ?? a.maxScore ?? null,
    });
    nodeAssessmentsByNodeId[a.nodeId] = list;
  }

  const nodeCompetencies = db
    .select({
      nodeId: roadmapNodeCompetencies.nodeId,
      competencyId: roadmapNodeCompetencies.competencyId,
      competencyTitle: competencies.title,
    })
    .from(roadmapNodeCompetencies)
    .innerJoin(
      competencies,
      eq(roadmapNodeCompetencies.competencyId, competencies.id),
    )
    .where(inArray(roadmapNodeCompetencies.nodeId, nodeIds))
    .all();
  const nodeCompetenciesByNodeId: RoadmapProgressionContext["nodeCompetenciesByNodeId"] =
    {};
  for (const c of nodeCompetencies) {
    const list = nodeCompetenciesByNodeId[c.nodeId] ?? [];
    list.push({ id: c.competencyId, title: c.competencyTitle });
    nodeCompetenciesByNodeId[c.nodeId] = list;
  }

  const masteryByCompetencyId = new Map<string, any>(
    masteryRows.map((m: any) => [m.competencyId, m]),
  );
  const competencyStates: Record<
    string,
    "not_started" | "learning" | "mastered" | "review_required"
  > = {};
  for (const m of masteryRows)
    competencyStates[m.competencyId] = m.state as
      | "not_started"
      | "learning"
      | "mastered"
      | "review_required";
  const masteredNodeIds: string[] = [];
  const reviewRequiredNodeIds: string[] = [];
  for (const nodeId of nodeIds) {
    const comps = nodeCompetenciesByNodeId[nodeId] ?? [];
    if (comps.length === 0) continue;
    const states = comps.map(
      (c) => masteryByCompetencyId.get(c.id)?.state ?? "not_started",
    );
    if (states.every((s) => s === "mastered")) masteredNodeIds.push(nodeId);
    else if (states.some((s) => s === "review_required"))
      reviewRequiredNodeIds.push(nodeId);
  }

  return {
    unlockRulesByNodeId,
    branchChoices,
    competencyMasteredIds,
    competencyScores,
    competencyStates,
    passedAssessmentIds,
    assessmentScores,
    masteredNodeIds: masteredNodeIds as string[],
    reviewRequiredNodeIds: reviewRequiredNodeIds as string[],
    primaryLearningItemByNodeId,
    nodeCompetenciesByNodeId,
    nodeResourcesByNodeId,
    nodeAssessmentsByNodeId,
  };
}
