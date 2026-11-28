import {
  getLearningItemById,
  getUserLearningItemProgress,
  getUserRoadmapProgress,
  listActiveLearningItems,
  listLearningItemOccurrences,
} from "@/db/repositories/mastery.repo";
import { loadRoadmapProgressionContext } from "@/db/repositories/roadmap-progression.repo";
import { getRoadmapById } from "@/db/repositories/roadmaps.repo";
import {
  buildMasteryHref,
  fallbackLearningItemIdForNode,
} from "@/modules/mastery/lib/mastery-href";
import type { MasteryCardVM } from "@/modules/mastery/types/mastery";
import { buildRoadmapNodeVMsWithProgression } from "@/modules/roadmaps/utils/roadmap-progression-adapter";
import type { RoadmapNodeVM } from "@/modules/roadmaps/types/roadmap";

export function isSafeSourceHref(value: string | null | undefined): value is string {
  if (typeof value !== "string" || !value) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  return false;
}

function toSourceHref(sourceRef: string | null | undefined): string | undefined {
  return isSafeSourceHref(sourceRef) ? sourceRef : undefined;
}

export function listMasteryCards(args?: {
  userId?: string | null;
  roadmapId?: string | null;
}): MasteryCardVM[] {
  const items = listActiveLearningItems();
  const cards = items.map((item) => {
    const occurrences = listLearningItemOccurrences(item.id);
    const filteredOccurrences = args?.roadmapId
      ? occurrences.filter((o) => o.roadmapId === args.roadmapId)
      : occurrences;
    const progress = args?.userId
      ? getUserLearningItemProgress({
          userId: args.userId,
          learningItemId: item.id,
        })
      : null;
    const primaryOccurrence =
      filteredOccurrences.find((o) => o.isPrimary) ?? filteredOccurrences[0];
    return {
      learningItemId: item.id,
      title: item.title,
      description:
        primaryOccurrence?.nodeDescription ??
        (item.sourceRef.startsWith("node:")
          ? "Learning card for roadmap mastery."
          : ""),
      kind: item.kind,
      sourceType: item.sourceType,
      ...(toSourceHref(item.sourceRef)
        ? { sourceHref: item.sourceRef }
        : {}),
      estimatedMin: item.estimatedMin,
      roadmapOccurrences: (args?.roadmapId ? filteredOccurrences : occurrences).map(
        (o) => ({
          roadmapId: o.roadmapId,
          roadmapTitle: o.roadmapTitle,
          nodeId: o.nodeId,
          nodeTitle: o.nodeTitle,
          prerequisites: [],
          masteryHref: buildMasteryHref(item.id, {
            roadmapId: o.roadmapId,
            nodeId: o.nodeId,
          }),
        }),
      ),
      ...(progress
        ? {
            progress: {
              status: progress.status,
              completedAt: progress.completedAt?.toISOString() ?? null,
            },
          }
        : {}),
    } satisfies MasteryCardVM;
  });

  if (args?.roadmapId) {
    return cards.filter((c) => c.roadmapOccurrences.length > 0);
  }
  return cards;
}

export interface MasteryCardDetailResult {
  card: MasteryCardVM;
  nodeVm: RoadmapNodeVM | null;
  roadmapTitle?: string;
}

export function getMasteryCardDetail(args: {
  learningItemId: string;
  userId?: string | null;
  roadmapId?: string | null;
  nodeId?: string | null;
}): MasteryCardDetailResult | null {
  const item = getLearningItemById(args.learningItemId);
  if (!item || !item.active) return null;

  const occurrences = listLearningItemOccurrences(item.id);
  const progress = args.userId
    ? getUserLearningItemProgress({
        userId: args.userId,
        learningItemId: item.id,
      })
    : null;

  let nodeVm: RoadmapNodeVM | null = null;
  let roadmapTitle: string | undefined;
  let roadmapContext: MasteryCardVM["roadmapContext"];

  const selectedOccurrence =
    (args.roadmapId && args.nodeId
      ? occurrences.find(
          (o) => o.roadmapId === args.roadmapId && o.nodeId === args.nodeId,
        )
      : null) ??
    (args.roadmapId
      ? occurrences.find((o) => o.roadmapId === args.roadmapId)
      : null) ??
    occurrences.find((o) => o.isPrimary) ??
    occurrences[0];

  const contextRoadmapId = args.roadmapId ?? selectedOccurrence?.roadmapId;
  const contextNodeId = args.nodeId ?? selectedOccurrence?.nodeId;

  if (contextRoadmapId) {
    const roadmap = getRoadmapById(contextRoadmapId);
    if (roadmap) {
      roadmapTitle = roadmap.title;
      const nodeIds = roadmap.nodes.map((n) => n.id);
      const progressionCtx = args.userId
        ? loadRoadmapProgressionContext({
            userId: args.userId,
            roadmapId: roadmap.id,
            nodeIds,
          })
        : {
            branchChoices: {},
            primaryLearningItemByNodeId: {},
            nodeCompetenciesByNodeId: {},
            nodeResourcesByNodeId: {},
            nodeAssessmentsByNodeId: {},
          };

      // Verify learning item belongs to node/resource if nodeId supplied
      if (contextNodeId) {
        const node = roadmap.nodes.find((n) => n.id === contextNodeId);
        if (node) {
          const primary =
            progressionCtx.primaryLearningItemByNodeId[contextNodeId];
          const primaryId =
            primary?.learningItemId ?? fallbackLearningItemIdForNode(node.id);
          const resources =
            progressionCtx.nodeResourcesByNodeId[contextNodeId] ?? [];
          const belongs =
            primaryId === item.id ||
            resources.some((r) => r.id === item.id) ||
            occurrences.some(
              (o) => o.roadmapId === contextRoadmapId && o.nodeId === contextNodeId,
            );
          if (belongs) {
            const progressState = args.userId
              ? getUserRoadmapProgress({
                  userId: args.userId,
                  roadmapId: roadmap.id,
                })
              : { completedNodeIds: [], inProgressNodeId: null };
            const vms = buildRoadmapNodeVMsWithProgression(
              roadmap,
              progressState,
              progressionCtx,
            );
            nodeVm = vms.find((n) => n.id === contextNodeId) ?? null;
            if (nodeVm) {
              roadmapContext = {
                roadmapId: roadmap.id,
                roadmapTitle: roadmap.title,
                nodeId: nodeVm.id,
                nodeTitle: nodeVm.title,
                status: nodeVm.status,
                prerequisites: nodeVm.prerequisites,
                unlockRule: nodeVm.unlockRule,
                failedConditions: nodeVm.failedConditions,
                satisfiedConditions: nodeVm.satisfiedConditions,
                canOpen: nodeVm.canOpen,
                canComplete: nodeVm.canComplete,
              };
            }
          }
        }
      }
    }
  }

  const card: MasteryCardVM = {
    learningItemId: item.id,
    title: item.title,
    description:
      nodeVm?.description ??
      selectedOccurrence?.nodeDescription ??
      (item.sourceRef.startsWith("node:")
        ? "Learning card for roadmap mastery."
        : ""),
    kind: nodeVm?.lessonInfo?.kind ?? item.kind,
    sourceType: item.sourceType,
    ...(toSourceHref(nodeVm?.sourceHref ?? item.sourceRef)
      ? { sourceHref: (nodeVm?.sourceHref ?? item.sourceRef) as string }
      : {}),
    estimatedMin: item.estimatedMin,
    ...(roadmapContext ? { roadmapContext } : {}),
    roadmapOccurrences: occurrences.map((o) => ({
      roadmapId: o.roadmapId,
      roadmapTitle: o.roadmapTitle,
      nodeId: o.nodeId,
      nodeTitle: o.nodeTitle,
      prerequisites: [],
      masteryHref: buildMasteryHref(item.id, {
        roadmapId: o.roadmapId,
        nodeId: o.nodeId,
      }),
    })),
    ...(progress
      ? {
          progress: {
            status: progress.status,
            completedAt: progress.completedAt?.toISOString() ?? null,
          },
        }
      : {}),
    ...(nodeVm?.resources ? { resources: nodeVm.resources } : {}),
    ...(nodeVm?.assessments ? { assessments: nodeVm.assessments } : {}),
    ...(nodeVm?.competencies?.length
      ? { competencyIds: nodeVm.competencies.map((c) => c.id) }
      : {}),
  };

  return { card, nodeVm, roadmapTitle };
}
