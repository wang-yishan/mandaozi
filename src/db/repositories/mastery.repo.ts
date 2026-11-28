import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "../index";
import {
  learningItems,
  roadmapNodeAssessments,
  roadmapNodeResources,
  roadmapNodeRules,
  roadmapNodes,
  roadmaps,
  userAssessmentAttempts,
  userLearningItemProgress,
  userRoadmapNodeProgress,
} from "../schema";

export interface MasteryLearningItemRow {
  id: string;
  kind: string;
  title: string;
  sourceType: string;
  sourceRef: string;
  estimatedMin: number | null;
  active: boolean;
}

export interface MasteryOccurrenceRow {
  roadmapId: string;
  roadmapTitle: string;
  nodeId: string;
  nodeTitle: string;
  nodeDescription: string;
  nodeCategory: string;
  estimatedDuration: string;
  lessonKind: string | null;
  lessonLabel: string | null;
  lessonHref: string | null;
  isPrimary: boolean;
  role: string;
  sortOrder: number;
}

export function listActiveLearningItems(): MasteryLearningItemRow[] {
  return db
    .select({
      id: learningItems.id,
      kind: learningItems.kind,
      title: learningItems.title,
      sourceType: learningItems.sourceType,
      sourceRef: learningItems.sourceRef,
      estimatedMin: learningItems.estimatedMin,
      active: learningItems.active,
    })
    .from(learningItems)
    .where(eq(learningItems.active, true))
    .orderBy(asc(learningItems.title))
    .all();
}

export function getLearningItemById(
  id: string,
): MasteryLearningItemRow | null {
  const row = db
    .select({
      id: learningItems.id,
      kind: learningItems.kind,
      title: learningItems.title,
      sourceType: learningItems.sourceType,
      sourceRef: learningItems.sourceRef,
      estimatedMin: learningItems.estimatedMin,
      active: learningItems.active,
    })
    .from(learningItems)
    .where(eq(learningItems.id, id))
    .get();
  return row ?? null;
}

export function listLearningItemOccurrences(
  learningItemId: string,
): MasteryOccurrenceRow[] {
  return db
    .select({
      roadmapId: roadmaps.id,
      roadmapTitle: roadmaps.title,
      nodeId: roadmapNodes.id,
      nodeTitle: roadmapNodes.title,
      nodeDescription: roadmapNodes.description,
      nodeCategory: roadmapNodes.category,
      estimatedDuration: roadmapNodes.estimatedDuration,
      lessonKind: roadmapNodes.lessonKind,
      lessonLabel: roadmapNodes.lessonLabel,
      lessonHref: roadmapNodes.lessonHref,
      isPrimary: roadmapNodeResources.isPrimary,
      role: roadmapNodeResources.role,
      sortOrder: roadmapNodeResources.sortOrder,
    })
    .from(roadmapNodeResources)
    .innerJoin(roadmapNodes, eq(roadmapNodeResources.nodeId, roadmapNodes.id))
    .innerJoin(roadmaps, eq(roadmapNodes.roadmapId, roadmaps.id))
    .where(eq(roadmapNodeResources.learningItemId, learningItemId))
    .orderBy(asc(roadmaps.sortOrder), asc(roadmapNodes.sortOrder))
    .all();
}

export function getUserLearningItemProgress(args: {
  userId: string;
  learningItemId: string;
}): { status: "not_started" | "in_progress" | "completed"; completedAt: Date | null } | null {
  const row = db
    .select()
    .from(userLearningItemProgress)
    .where(
      and(
        eq(userLearningItemProgress.userId, args.userId),
        eq(userLearningItemProgress.learningItemId, args.learningItemId),
      ),
    )
    .get();
  if (!row) return null;
  const status =
    row.status === "completed"
      ? "completed"
      : row.status === "in_progress"
        ? "in_progress"
        : "not_started";
  return { status, completedAt: row.completedAt ?? null };
}

export function upsertUserLearningItemProgress(args: {
  userId: string;
  learningItemId: string;
  status: "not_started" | "in_progress" | "completed";
  completedAt?: Date | null;
}): void {
  const now = new Date();
  db.insert(userLearningItemProgress)
    .values({
      userId: args.userId,
      learningItemId: args.learningItemId,
      status: args.status,
      completedAt:
        args.status === "completed" ? (args.completedAt ?? now) : null,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [
        userLearningItemProgress.userId,
        userLearningItemProgress.learningItemId,
      ],
      set: {
        status: args.status,
        completedAt:
          args.status === "completed" ? (args.completedAt ?? now) : null,
        updatedAt: now,
      },
    })
    .run();
}

export function listLearningItemsByIds(ids: string[]): MasteryLearningItemRow[] {
  if (ids.length === 0) return [];
  return db
    .select({
      id: learningItems.id,
      kind: learningItems.kind,
      title: learningItems.title,
      sourceType: learningItems.sourceType,
      sourceRef: learningItems.sourceRef,
      estimatedMin: learningItems.estimatedMin,
      active: learningItems.active,
    })
    .from(learningItems)
    .where(inArray(learningItems.id, ids))
    .all();
}

export function getUserRoadmapProgress(args: {
  userId: string;
  roadmapId: string;
}): { completedNodeIds: string[]; inProgressNodeId: string | null } {
  const rows = db
    .select()
    .from(userRoadmapNodeProgress)
    .where(
      and(
        eq(userRoadmapNodeProgress.userId, args.userId),
        eq(userRoadmapNodeProgress.roadmapId, args.roadmapId),
      ),
    )
    .all();
  const completedNodeIds: string[] = [];
  let inProgressNodeId: string | null = null;
  for (const r of rows) {
    if (r.status === "completed") completedNodeIds.push(r.nodeId);
    if (r.status === "in-progress") inProgressNodeId = r.nodeId;
  }
  return { completedNodeIds, inProgressNodeId };
}

export interface CompleteMasteryNodeResult {
  learningItemCompleted: boolean;
  nodeCompleted: boolean;
  nodeWasAlreadyCompleted: boolean;
  locked: boolean;
  missingAssessmentIds: string[];
}

export function completeMasteryNodeInDb(args: {
  userId: string;
  learningItemId: string;
  roadmapId: string;
  nodeId: string;
}): CompleteMasteryNodeResult {
  const now = new Date();

  return db.transaction((tx: any) => {
    // Verify learning item belongs to node/resource
    const resource = tx
      .select({ learningItemId: roadmapNodeResources.learningItemId })
      .from(roadmapNodeResources)
      .where(
        and(
          eq(roadmapNodeResources.nodeId, args.nodeId),
          eq(roadmapNodeResources.learningItemId, args.learningItemId),
        ),
      )
      .get();
    const node = tx
      .select({ id: roadmapNodes.id, roadmapId: roadmapNodes.roadmapId })
      .from(roadmapNodes)
      .where(eq(roadmapNodes.id, args.nodeId))
      .get();
    if (!node || node.roadmapId !== args.roadmapId) {
      throw new Error("INVALID_NODE_CONTEXT");
    }
    // Allow primary-by-fallback: if no resource row exists, allow li:node:<nodeId>
    const fallback = `li:node:${args.nodeId}`;
    if (!resource && args.learningItemId !== fallback) {
      // Also allow if it's the only/primary learning item by being referenced? Be strict but usable.
      const anyResource = tx
        .select({ learningItemId: roadmapNodeResources.learningItemId })
        .from(roadmapNodeResources)
        .where(eq(roadmapNodeResources.nodeId, args.nodeId))
        .get();
      if (anyResource) {
        throw new Error("LEARNING_ITEM_NOT_IN_NODE");
      }
    }

    // Upsert learning item progress as completed (individual card).
    tx.insert(userLearningItemProgress)
      .values({
        userId: args.userId,
        learningItemId: args.learningItemId,
        status: "completed",
        completedAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [userLearningItemProgress.userId, userLearningItemProgress.learningItemId],
        set: { status: "completed", completedAt: now, updatedAt: now },
      })
      .run();

    // Check node already completed
    const existingNodeProgress = tx
      .select()
      .from(userRoadmapNodeProgress)
      .where(
        and(
          eq(userRoadmapNodeProgress.userId, args.userId),
          eq(userRoadmapNodeProgress.roadmapId, args.roadmapId),
          eq(userRoadmapNodeProgress.nodeId, args.nodeId),
        ),
      )
      .get();
    if (existingNodeProgress?.status === "completed") {
      return {
        learningItemCompleted: true,
        nodeCompleted: true,
        nodeWasAlreadyCompleted: true,
        locked: false,
        missingAssessmentIds: [],
      };
    }

    // Check required assessments passed
    const requiredAssessments = tx
      .select({ assessmentId: roadmapNodeAssessments.assessmentId })
      .from(roadmapNodeAssessments)
      .where(
        and(
          eq(roadmapNodeAssessments.nodeId, args.nodeId),
          eq(roadmapNodeAssessments.required, true),
        ),
      )
      .all();
    const missingAssessmentIds: string[] = [];
    for (const ra of requiredAssessments) {
      const passed = tx
        .select({ id: userAssessmentAttempts.id })
        .from(userAssessmentAttempts)
        .where(
          and(
            eq(userAssessmentAttempts.userId, args.userId),
            eq(userAssessmentAttempts.assessmentId, ra.assessmentId),
            eq(userAssessmentAttempts.passed, true),
          ),
        )
        .get();
      if (!passed) missingAssessmentIds.push(ra.assessmentId);
    }

    // If required assessments missing, don't mark node complete - card completion is still recorded.
    if (missingAssessmentIds.length > 0) {
      // Mark node in-progress if not completed
      tx.insert(userRoadmapNodeProgress)
        .values({
          userId: args.userId,
          roadmapId: args.roadmapId,
          nodeId: args.nodeId,
          status: "in-progress",
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [
            userRoadmapNodeProgress.userId,
            userRoadmapNodeProgress.roadmapId,
            userRoadmapNodeProgress.nodeId,
          ],
          set: { status: "in-progress", updatedAt: now },
        })
        .run();
      return {
        learningItemCompleted: true,
        nodeCompleted: false,
        nodeWasAlreadyCompleted: false,
        locked: false,
        missingAssessmentIds,
      };
    }

    // Mark node completed. Unlock of dependents is computed by progression engine on read.
    tx.insert(userRoadmapNodeProgress)
      .values({
        userId: args.userId,
        roadmapId: args.roadmapId,
        nodeId: args.nodeId,
        status: "completed",
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [
          userRoadmapNodeProgress.userId,
          userRoadmapNodeProgress.roadmapId,
          userRoadmapNodeProgress.nodeId,
        ],
        set: { status: "completed", updatedAt: now },
      })
      .run();

    return {
      learningItemCompleted: true,
      nodeCompleted: true,
      nodeWasAlreadyCompleted: false,
      locked: false,
      missingAssessmentIds: [],
    };
  });
}
