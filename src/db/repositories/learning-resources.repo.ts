import { asc, eq } from "drizzle-orm";
import { db } from "../index";
import { learningItems, roadmapNodeResources } from "../schema";

export interface LearningItemRecord {
  id: string;
  kind: string;
  title: string;
  sourceType: string;
  sourceRef: string;
  estimatedMin: number | null;
  metaJson: unknown;
  active: boolean;
}

export function upsertLearningItem(item: LearningItemRecord): void {
  const now = new Date();
  db.insert(learningItems)
    .values({
      id: item.id,
      kind: item.kind,
      title: item.title,
      sourceType: item.sourceType,
      sourceRef: item.sourceRef,
      estimatedMin: item.estimatedMin,
      metaJson: item.metaJson ?? null,
      active: item.active,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: learningItems.id,
      set: {
        kind: item.kind,
        title: item.title,
        sourceType: item.sourceType,
        sourceRef: item.sourceRef,
        estimatedMin: item.estimatedMin,
        metaJson: item.metaJson ?? null,
        active: item.active,
        updatedAt: now,
      },
    })
    .run();
}

export function listNodeLearningResources(nodeId: string) {
  return db
    .select({
      nodeId: roadmapNodeResources.nodeId,
      role: roadmapNodeResources.role,
      sortOrder: roadmapNodeResources.sortOrder,
      item: learningItems,
    })
    .from(roadmapNodeResources)
    .innerJoin(
      learningItems,
      eq(roadmapNodeResources.learningItemId, learningItems.id),
    )
    .where(eq(roadmapNodeResources.nodeId, nodeId))
    .orderBy(asc(roadmapNodeResources.sortOrder))
    .all();
}

export function attachLearningItemToNode(args: {
  nodeId: string;
  learningItemId: string;
  role?: "learn" | "practice" | "review" | "assessment";
  sortOrder?: number;
}): void {
  db.insert(roadmapNodeResources)
    .values({
      nodeId: args.nodeId,
      learningItemId: args.learningItemId,
      role: args.role ?? "learn",
      sortOrder: args.sortOrder ?? 0,
      unlockRuleJson: null,
    })
    .onConflictDoNothing()
    .run();
}
