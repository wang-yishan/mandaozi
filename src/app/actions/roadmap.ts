"use server";

import { headers } from "next/headers";
import { z } from "zod";
import {
  listCompletedRoadmaps,
  listUserRoadmapRecords,
  setSelectedRoadmap,
  setUserRoadmapBranchChoice,
} from "@/db/repositories/user-roadmap-records.repo";
import { auth } from "@/lib/auth";

const setSelectedRoadmapSchema = z.object({
  roadmapId: z.string().min(1).nullable(),
});

const setBranchChoiceSchema = z.object({
  roadmapId: z.string().min(1),
  choiceNodeId: z.string().min(1),
  choiceId: z.string().min(1).nullable(),
});

async function requireUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }
  return session.user.id;
}

export async function setSelectedRoadmapAction(input: {
  roadmapId: string | null;
}) {
  const userId = await requireUserId();
  const parsed = setSelectedRoadmapSchema.parse(input);
  setSelectedRoadmap(userId, parsed.roadmapId);
  return { ok: true as const, selectedPathRoadmapId: parsed.roadmapId };
}

export async function setRoadmapBranchChoiceAction(input: {
  roadmapId: string;
  choiceNodeId: string;
  choiceId: string | null;
}) {
  const userId = await requireUserId();
  const parsed = setBranchChoiceSchema.parse(input);
  setUserRoadmapBranchChoice({
    userId,
    roadmapId: parsed.roadmapId,
    choiceNodeId: parsed.choiceNodeId,
    choiceId: parsed.choiceId,
  });
  return { ok: true as const };
}

export async function listUserRoadmapRecordsAction() {
  const userId = await requireUserId();
  return {
    records: listUserRoadmapRecords(userId),
    completed: listCompletedRoadmaps(userId),
  };
}

const progressionContextSchema = z.object({
  roadmapId: z.string().min(1),
  nodeIds: z.array(z.string().min(1)).max(500),
});

export async function getRoadmapProgressionContextAction(input: {
  roadmapId: string;
  nodeIds: string[];
}) {
  const userId = await requireUserId();
  const parsed = progressionContextSchema.parse(input);
  const { loadRoadmapProgressionContext } = await import(
    "@/db/repositories/roadmap-progression.repo"
  );
  return loadRoadmapProgressionContext({
    userId,
    roadmapId: parsed.roadmapId,
    nodeIds: parsed.nodeIds,
  });
}
