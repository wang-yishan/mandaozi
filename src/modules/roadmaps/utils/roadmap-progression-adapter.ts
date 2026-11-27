import {
  evaluateNodeUnlock,
  legacyPrerequisiteRule,
} from "@/modules/progression/engine";
import type { ProgressionRule } from "@/modules/progression/rule-schema";
import type { ProgressionContext } from "@/modules/progression/types";
import type {
  RoadmapDef,
  RoadmapNodeDef,
  RoadmapNodeStatus,
  RoadmapNodeVM,
  RoadmapProgress,
} from "../types/roadmap";
import { normalizeRoadmapProgress } from "./roadmap-progress";

export interface RoadmapProgressionInput {
  /** Optional explicit unlock rules by node id; falls back to legacy prerequisiteIds. */
  unlockRulesByNodeId?: Record<string, ProgressionRule | null | undefined>;
  /** Branch choices: nodeId -> choiceId */
  branchChoices?: Record<string, string>;
  competencyMasteredIds?: string[];
  competencyScores?: Record<string, number>;
  competencyStates?: Record<
    string,
    "not_started" | "learning" | "mastered" | "review_required"
  >;
  passedAssessmentIds?: string[];
  assessmentScores?: Record<string, number>;
  masteredNodeIds?: string[];
  reviewRequiredNodeIds?: string[];
  nodeCompetenciesByNodeId?: Record<
    string,
    Array<{ id: string; title: string }>
  >;
  nodeResourcesByNodeId?: Record<
    string,
    Array<{
      id: string;
      title: string;
      kind: string;
      href?: string;
      role: "learn" | "practice" | "review" | "assessment";
    }>
  >;
  nodeAssessmentsByNodeId?: Record<
    string,
    Array<{
      id: string;
      title: string;
      kind?: string;
      passed?: boolean | null;
      lastScore?: number | null;
      maxScore?: number | null;
    }>
  >;
}

function toUiStatus(
  status:
    | "locked"
    | "available"
    | "in_progress"
    | "completed"
    | "mastered"
    | "review_required",
): RoadmapNodeStatus {
  if (status === "in_progress") return "in-progress";
  return status;
}

function buildContext(
  progress: RoadmapProgress,
  input?: RoadmapProgressionInput,
): ProgressionContext {
  return {
    completedNodeIds: new Set(progress.completedNodeIds),
    inProgressNodeIds: new Set(
      progress.inProgressNodeId ? [progress.inProgressNodeId] : [],
    ),
    masteredNodeIds: new Set(input?.masteredNodeIds ?? []),
    reviewRequiredNodeIds: new Set(input?.reviewRequiredNodeIds ?? []),
    competencyMasteredIds: new Set(input?.competencyMasteredIds ?? []),
    competencyScores: new Map(Object.entries(input?.competencyScores ?? {})),
    passedAssessmentIds: new Set(input?.passedAssessmentIds ?? []),
    assessmentScores: new Map(Object.entries(input?.assessmentScores ?? {})),
    branchChoices: new Map(Object.entries(input?.branchChoices ?? {})),
  };
}

function resolveUnlockRule(
  node: RoadmapNodeDef,
  input?: RoadmapProgressionInput,
): ProgressionRule | null {
  const explicit = input?.unlockRulesByNodeId?.[node.id];
  if (explicit !== undefined) return explicit;
  return legacyPrerequisiteRule(node.prerequisiteIds);
}

export function getRecommendedNodeIdWithProgression(
  roadmap: RoadmapDef,
  progress?: Partial<RoadmapProgress> | null,
  input?: RoadmapProgressionInput,
): string | null {
  const normalized = normalizeRoadmapProgress(progress);
  const ctx = buildContext(normalized, input);

  // Preserve in-progress if still unlocked and not completed.
  if (
    normalized.inProgressNodeId &&
    roadmap.nodes.some((n) => n.id === normalized.inProgressNodeId) &&
    !normalized.completedNodeIds.includes(normalized.inProgressNodeId)
  ) {
    const node = roadmap.nodes.find(
      (n) => n.id === normalized.inProgressNodeId,
    );
    if (node) {
      const evalResult = evaluateNodeUnlock({
        nodeId: node.id,
        unlockRule: resolveUnlockRule(node, input),
        ctx,
        isInProgress: true,
        isCompleted: false,
      });
      if (evalResult.unlocked) return node.id;
    }
  }

  for (const node of roadmap.nodes) {
    if (normalized.completedNodeIds.includes(node.id)) continue;
    const evalResult = evaluateNodeUnlock({
      nodeId: node.id,
      unlockRule: resolveUnlockRule(node, input),
      ctx,
      isInProgress: normalized.inProgressNodeId === node.id,
      isCompleted: false,
    });
    if (evalResult.unlocked) return node.id;
  }
  return null;
}

export function buildRoadmapNodeVMsWithProgression(
  roadmap: RoadmapDef,
  progress?: Partial<RoadmapProgress> | null,
  input?: RoadmapProgressionInput,
): RoadmapNodeVM[] {
  const normalized = normalizeRoadmapProgress(progress);
  const ctx = buildContext(normalized, input);
  const recommendedNodeId = getRecommendedNodeIdWithProgression(
    roadmap,
    normalized,
    input,
  );
  const byId = new Map(roadmap.nodes.map((n) => [n.id, n]));

  return roadmap.nodes.map((node) => {
    const isCompleted = normalized.completedNodeIds.includes(node.id);
    const isInProgress = normalized.inProgressNodeId === node.id;
    const evalResult = evaluateNodeUnlock({
      nodeId: node.id,
      unlockRule: resolveUnlockRule(node, input),
      ctx,
      isInProgress,
      isCompleted,
    });

    let status: RoadmapNodeStatus = toUiStatus(evalResult.status);
    if (
      status === "available" &&
      recommendedNodeId === node.id &&
      !isInProgress
    ) {
      status = "recommended";
    }

    const rawCompetencies = input?.nodeCompetenciesByNodeId?.[node.id] ?? [];
    const competencies = rawCompetencies.map((c) => {
      const explicitState = input?.competencyStates?.[c.id];
      const mastered = input?.competencyMasteredIds?.includes(c.id);
      const score = input?.competencyScores?.[c.id];
      const rawState =
        explicitState ??
        (mastered
          ? "mastered"
          : typeof score === "number" && score > 0
            ? "learning"
            : "not_started");
      // Simple auto flow: no manual review; treat legacy review_required as learning/retry.
      const state = rawState === "review_required" ? "learning" : rawState;
      return { ...c, state, score } as const;
    });
    const resources = input?.nodeResourcesByNodeId?.[node.id] ?? [];
    const assessments = input?.nodeAssessmentsByNodeId?.[node.id] ?? [];
    const masteryState =
      competencies.length === 0
        ? undefined
        : competencies.every((c) => c.state === "mastered")
          ? "mastered"
          : competencies.some(
                (c) => c.state === "learning" || c.state === "mastered",
              )
            ? "learning"
            : "not_started";

    return {
      ...node,
      status,
      prerequisites: node.prerequisiteIds.map((prereqId) => {
        const prereq = byId.get(prereqId);
        return {
          id: prereqId,
          title: prereq?.title ?? prereqId,
          completed: normalized.completedNodeIds.includes(prereqId),
        };
      }),
      ...(competencies.length ? { competencies } : {}),
      ...(resources.length ? { resources } : {}),
      ...(assessments.length ? { assessments } : {}),
      ...(masteryState ? { masteryState } : {}),
    };
  });
}
