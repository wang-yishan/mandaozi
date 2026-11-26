"use client";

import { useMemo } from "react";
import { useMadaraStore } from "@/store/madara-store";
import type { RoadmapDef, RoadmapNodeVM } from "../types/roadmap";
import {
  buildRoadmapNodeVMs,
  getCurrentLearningStage,
  getNextRecommendedNode,
  getRoadmapCompletion,
  normalizeRoadmapProgress,
} from "../utils/roadmap-progress";

export function useRoadmapProgress(roadmap: RoadmapDef) {
  const progress = useMadaraStore((s) => s.roadmapProgressById[roadmap.id]);
  const setRoadmapInProgress = useMadaraStore((s) => s.setRoadmapInProgress);

  return useMemo(() => {
    const normalized = normalizeRoadmapProgress(progress);
    const nodes: RoadmapNodeVM[] = buildRoadmapNodeVMs(roadmap, normalized);
    const completion = getRoadmapCompletion(roadmap, normalized);
    const currentStage = getCurrentLearningStage(roadmap, normalized);
    const nextNodeDef = getNextRecommendedNode(roadmap, normalized);
    const nextNode = nextNodeDef
      ? (nodes.find((n) => n.id === nextNodeDef.id) ?? null)
      : null;
    return {
      progress: normalized,
      nodes,
      completion,
      currentStage,
      nextNode,
      setRoadmapInProgress,
    };
  }, [progress, roadmap, setRoadmapInProgress]);
}
