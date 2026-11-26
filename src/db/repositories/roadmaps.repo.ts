import { asc, eq } from "drizzle-orm";
import type { RoadmapDef, RoadmapEdgeDef, RoadmapNodeDef } from "@/modules/roadmaps/types/roadmap";
import { db } from "../index";
import {
  roadmapEdges,
  roadmapNodePrerequisites,
  roadmapNodes,
  roadmaps,
} from "../schema";

function assembleRoadmap(roadmapRow: typeof roadmaps.$inferSelect): RoadmapDef {
  const nodeRows = db
    .select()
    .from(roadmapNodes)
    .where(eq(roadmapNodes.roadmapId, roadmapRow.id))
    .orderBy(asc(roadmapNodes.sortOrder))
    .all();

  const edgeRows = db
    .select()
    .from(roadmapEdges)
    .where(eq(roadmapEdges.roadmapId, roadmapRow.id))
    .all();

  const nodes: RoadmapNodeDef[] = nodeRows.map((n) => {
    const prereqs = db
      .select()
      .from(roadmapNodePrerequisites)
      .where(eq(roadmapNodePrerequisites.nodeId, n.id))
      .all();

    const node: RoadmapNodeDef = {
      id: n.id,
      title: n.title,
      description: n.description,
      category: n.category as RoadmapNodeDef["category"],
      estimatedDuration: n.estimatedDuration,
      prerequisiteIds: prereqs.map((p) => p.prerequisiteNodeId),
      position: { x: n.posX, y: n.posY },
    };

    if (n.lessonKind && n.lessonLabel) {
      node.lessonInfo = {
        kind: n.lessonKind as "lesson" | "practice" | "assessment",
        label: n.lessonLabel,
        ...(n.lessonHref ? { href: n.lessonHref } : {}),
      };
    }

    return node;
  });

  const edges: RoadmapEdgeDef[] = edgeRows.map((e) => ({
    id: e.id,
    source: e.sourceNodeId,
    target: e.targetNodeId,
    ...((e.kind as "main" | "branch") !== "main" ? { kind: e.kind as "main" | "branch" } : {}),
  }));

  return {
    id: roadmapRow.id,
    title: roadmapRow.title,
    description: roadmapRow.description,
    nodes,
    edges,
  };
}

export function listRoadmaps(): RoadmapDef[] {
  const rows = db.select().from(roadmaps).orderBy(asc(roadmaps.sortOrder)).all();
  return rows.map(assembleRoadmap);
}

export function getRoadmapById(id: string): RoadmapDef | undefined {
  const row = db.select().from(roadmaps).where(eq(roadmaps.id, id)).get();
  return row ? assembleRoadmap(row) : undefined;
}

export function getDefaultRoadmapId(): string {
  const row = db.select().from(roadmaps).orderBy(asc(roadmaps.sortOrder)).get();
  return row?.id ?? "mandarin-beginner-foundation";
}
