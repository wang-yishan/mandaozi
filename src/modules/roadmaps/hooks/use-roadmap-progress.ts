"use client";

import { useEffect, useMemo, useState } from "react";
import { getRoadmapProgressionContextAction } from "@/app/actions/roadmap";
import { useMadaraStore } from "@/store/madara-store";
import type { RoadmapDef, RoadmapNodeVM } from "../types/roadmap";
import {
  getCurrentLearningStage,
  getRoadmapCompletion,
  normalizeRoadmapProgress,
} from "../utils/roadmap-progress";
import {
  buildRoadmapNodeVMsWithProgression,
  type RoadmapProgressionInput,
} from "../utils/roadmap-progression-adapter";

export function useRoadmapProgress(roadmap: RoadmapDef) {
  const progress = useMadaraStore((s) => s.roadmapProgressById[roadmap.id]);
  const roadmapChoiceById = useMadaraStore((s) => s.roadmapChoiceById);
  const setRoadmapInProgress = useMadaraStore((s) => s.setRoadmapInProgress);
  const [progressionInput, setProgressionInput] =
    useState<RoadmapProgressionInput | null>(null);

  useEffect(() => {
    let cancelled = false;
    const nodeIds = roadmap.nodes.map((n) => n.id);
    void getRoadmapProgressionContextAction({ roadmapId: roadmap.id, nodeIds })
      .then((ctx) => {
        if (cancelled) return;
        setProgressionInput({
          unlockRulesByNodeId: ctx.unlockRulesByNodeId,
          branchChoices: ctx.branchChoices,
          competencyMasteredIds: ctx.competencyMasteredIds,
          competencyScores: ctx.competencyScores,
          competencyStates: ctx.competencyStates,
          passedAssessmentIds: ctx.passedAssessmentIds,
          assessmentScores: ctx.assessmentScores,
          masteredNodeIds: ctx.masteredNodeIds,
          reviewRequiredNodeIds: ctx.reviewRequiredNodeIds,
          primaryLearningItemByNodeId: ctx.primaryLearningItemByNodeId,
          nodeCompetenciesByNodeId: ctx.nodeCompetenciesByNodeId,
          nodeResourcesByNodeId: ctx.nodeResourcesByNodeId,
          nodeAssessmentsByNodeId: ctx.nodeAssessmentsByNodeId,
        });
      })
      .catch(() => {
        if (!cancelled) setProgressionInput(null);
      });
    return () => {
      cancelled = true;
    };
  }, [roadmap.id, roadmap.nodes]);

  return useMemo(() => {
    const normalized = normalizeRoadmapProgress(progress);
    const localBranchChoices = roadmapChoiceById[roadmap.id] ?? {};
    const branchChoices = {
      ...(progressionInput?.branchChoices ?? {}),
      ...localBranchChoices,
    };
    const nodes: RoadmapNodeVM[] = buildRoadmapNodeVMsWithProgression(
      roadmap,
      normalized,
      {
        ...progressionInput,
        branchChoices,
      },
    );
    const completion = getRoadmapCompletion(roadmap, normalized);
    const currentStage = getCurrentLearningStage(roadmap, normalized);
    const nextNode =
      nodes.find(
        (n) =>
          n.status === "recommended" ||
          n.status === "in-progress" ||
          n.status === "review_required",
      ) ?? null;
    return {
      progress: normalized,
      nodes,
      completion,
      currentStage,
      nextNode,
      setRoadmapInProgress,
    };
  }, [
    progress,
    progressionInput,
    roadmap,
    roadmapChoiceById,
    setRoadmapInProgress,
  ]);
}
