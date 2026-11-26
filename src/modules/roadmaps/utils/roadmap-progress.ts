import type {
  RoadmapDef,
  RoadmapNodeDef,
  RoadmapNodeStatus,
  RoadmapNodeVM,
  RoadmapProgress,
} from "../types/roadmap";

export const EMPTY_ROADMAP_PROGRESS: RoadmapProgress = {
  completedNodeIds: [],
  inProgressNodeId: null,
};

export function normalizeRoadmapProgress(
  progress?: Partial<RoadmapProgress> | null,
): RoadmapProgress {
  if (!progress) return EMPTY_ROADMAP_PROGRESS;
  const completedNodeIds = Array.isArray(progress.completedNodeIds)
    ? progress.completedNodeIds.filter(
        (id): id is string => typeof id === "string",
      )
    : [];
  const inProgressNodeId =
    typeof progress.inProgressNodeId === "string"
      ? progress.inProgressNodeId
      : null;
  return { completedNodeIds, inProgressNodeId };
}

export function isNodeCompleted(
  progress: RoadmapProgress,
  nodeId: string,
): boolean {
  return progress.completedNodeIds.includes(nodeId);
}

export function arePrerequisitesMet(
  node: RoadmapNodeDef,
  progress: RoadmapProgress,
): boolean {
  return node.prerequisiteIds.every((prereqId) =>
    isNodeCompleted(progress, prereqId),
  );
}

export function getRecommendedNodeId(
  roadmap: RoadmapDef,
  progress: RoadmapProgress,
): string | null {
  const normalized = normalizeRoadmapProgress(progress);
  if (
    normalized.inProgressNodeId &&
    roadmap.nodes.some((n) => n.id === normalized.inProgressNodeId) &&
    !isNodeCompleted(normalized, normalized.inProgressNodeId)
  ) {
    const inProgressNode = roadmap.nodes.find(
      (n) => n.id === normalized.inProgressNodeId,
    );
    if (inProgressNode && arePrerequisitesMet(inProgressNode, normalized)) {
      return normalized.inProgressNodeId;
    }
  }

  for (const node of roadmap.nodes) {
    if (isNodeCompleted(normalized, node.id)) continue;
    if (arePrerequisitesMet(node, normalized)) return node.id;
  }

  return null;
}

export function getNodeStatus(
  node: RoadmapNodeDef,
  progress: RoadmapProgress,
  recommendedNodeId: string | null,
): RoadmapNodeStatus {
  const normalized = normalizeRoadmapProgress(progress);
  if (isNodeCompleted(normalized, node.id)) return "completed";
  if (!arePrerequisitesMet(node, normalized)) return "locked";
  if (normalized.inProgressNodeId === node.id) return "in-progress";
  if (recommendedNodeId === node.id) return "recommended";
  return "available";
}

export function buildRoadmapNodeVMs(
  roadmap: RoadmapDef,
  progress?: Partial<RoadmapProgress> | null,
): RoadmapNodeVM[] {
  const normalized = normalizeRoadmapProgress(progress);
  const recommendedNodeId = getRecommendedNodeId(roadmap, normalized);
  const byId = new Map(roadmap.nodes.map((node) => [node.id, node]));

  return roadmap.nodes.map((node) => ({
    ...node,
    status: getNodeStatus(node, normalized, recommendedNodeId),
    prerequisites: node.prerequisiteIds.map((prereqId) => {
      const prereq = byId.get(prereqId);
      return {
        id: prereqId,
        title: prereq?.title ?? prereqId,
        completed: isNodeCompleted(normalized, prereqId),
      };
    }),
  }));
}

export function getRoadmapCompletion(
  roadmap: RoadmapDef,
  progress?: Partial<RoadmapProgress> | null,
) {
  const normalized = normalizeRoadmapProgress(progress);
  const total = roadmap.nodes.length;
  const completed = roadmap.nodes.filter((node) =>
    isNodeCompleted(normalized, node.id),
  ).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, percentage };
}

export function getCurrentLearningStage(
  roadmap: RoadmapDef,
  progress?: Partial<RoadmapProgress> | null,
): string {
  const { completed, total, percentage } = getRoadmapCompletion(
    roadmap,
    progress,
  );
  if (total === 0) return "Getting Started";
  if (percentage === 100) return "HSK 1 Ready";
  if (completed === 0) return "Getting Started";

  const normalized = normalizeRoadmapProgress(progress);
  const recommendedNodeId = getRecommendedNodeId(roadmap, normalized);
  const focusNode =
    (recommendedNodeId &&
      roadmap.nodes.find((n) => n.id === recommendedNodeId)) ||
    roadmap.nodes.find((n) => normalized.inProgressNodeId === n.id) ||
    roadmap.nodes.find((n) => !isNodeCompleted(normalized, n.id));

  if (!focusNode) return "Getting Started";
  switch (focusNode.category) {
    case "foundation":
      return "Pronunciation Foundation";
    case "vocabulary":
      return "Vocabulary Building";
    case "grammar":
      return "Grammar & Sentences";
    case "practice":
      return "Practice & Reinforcement";
    case "assessment":
      return "Assessment Ready";
    case "milestone":
      return "HSK 1 Ready";
    default:
      return "In Progress";
  }
}

export function getNextRecommendedNode(
  roadmap: RoadmapDef,
  progress?: Partial<RoadmapProgress> | null,
): RoadmapNodeDef | null {
  const normalized = normalizeRoadmapProgress(progress);
  const recommendedNodeId = getRecommendedNodeId(roadmap, normalized);
  if (!recommendedNodeId) return null;
  return roadmap.nodes.find((node) => node.id === recommendedNodeId) ?? null;
}
