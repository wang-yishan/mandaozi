"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  completeMasteryNodeInDb,
  getUserRoadmapProgress,
} from "@/db/repositories/mastery.repo";
import { loadRoadmapProgressionContext } from "@/db/repositories/roadmap-progression.repo";
import { getRoadmapById } from "@/db/repositories/roadmaps.repo";
import { buildRoadmapNodeVMsWithProgression } from "@/modules/roadmaps/utils/roadmap-progression-adapter";

const completeMasteryCardSchema = z.object({
  learningItemId: z.string().min(1),
  roadmapId: z.string().min(1).nullable().optional(),
  nodeId: z.string().min(1).nullable().optional(),
  idempotencyKey: z.string().min(1).nullable().optional(),
});

async function requireUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");
  return session.user.id;
}

export async function completeMasteryCardAction(
  input: z.input<typeof completeMasteryCardSchema>,
) {
  const userId = await requireUserId();
  const parsed = completeMasteryCardSchema.parse(input);
  const roadmapId = parsed.roadmapId ?? null;
  const nodeId = parsed.nodeId ?? null;

  if (!roadmapId || !nodeId) {
    // No roadmap context: just record learning item progress. No node completion.
    const { upsertUserLearningItemProgress } = await import(
      "@/db/repositories/mastery.repo"
    );
    upsertUserLearningItemProgress({
      userId,
      learningItemId: parsed.learningItemId,
      status: "completed",
    });
    return {
      ok: true as const,
      learningItemCompleted: true,
      nodeCompleted: false,
      nodeWasAlreadyCompleted: false,
      locked: false,
      missingAssessmentIds: [] as string[],
      nextMasteryHref: null as string | null,
      completedNodeIds: [] as string[],
    };
  }

  const roadmap = getRoadmapById(roadmapId);
  if (!roadmap) throw new Error("ROADMAP_NOT_FOUND");
  const node = roadmap.nodes.find((n) => n.id === nodeId);
  if (!node) throw new Error("NODE_NOT_FOUND");

  const nodeIds = roadmap.nodes.map((n) => n.id);
  const progressionCtx = loadRoadmapProgressionContext({
    userId,
    roadmapId,
    nodeIds,
  });
  const progressState = getUserRoadmapProgress({ userId, roadmapId });
  const vmsBefore = buildRoadmapNodeVMsWithProgression(
    roadmap,
    progressState,
    progressionCtx,
  );
  const nodeVm = vmsBefore.find((n) => n.id === nodeId);
  if (!nodeVm) throw new Error("NODE_NOT_FOUND");
  if (nodeVm.status === "locked") {
    return {
      ok: false as const,
      learningItemCompleted: false,
      nodeCompleted: false,
      nodeWasAlreadyCompleted: false,
      locked: true,
      missingAssessmentIds: [] as string[],
      nextMasteryHref: null as string | null,
      completedNodeIds: progressState.completedNodeIds,
    };
  }

  const result = completeMasteryNodeInDb({
    userId,
    learningItemId: parsed.learningItemId,
    roadmapId,
    nodeId,
  });

  // Recompute after persistence
  const progressAfter = getUserRoadmapProgress({ userId, roadmapId });
  const progressionAfter = loadRoadmapProgressionContext({
    userId,
    roadmapId,
    nodeIds,
  });
  const vmsAfter = buildRoadmapNodeVMsWithProgression(
    roadmap,
    progressAfter,
    progressionAfter,
  );
  const nextNode =
    vmsAfter.find(
      (n) =>
        n.status === "recommended" ||
        n.status === "in-progress" ||
        n.status === "available",
    ) ?? null;

  return {
    ok: true as const,
    ...result,
    nextMasteryHref: nextNode?.masteryHref ?? null,
    completedNodeIds: progressAfter.completedNodeIds,
  };
}
