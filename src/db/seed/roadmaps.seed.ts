import { eq } from "drizzle-orm";
import { ROADMAPS } from "../../modules/roadmaps/constants/roadmap-data";
import { db } from "../index";
import {
  roadmapEdges,
  roadmapNodePrerequisites,
  roadmapNodes,
  roadmaps,
} from "../schema";

export function seedRoadmaps() {
  let nodeCount = 0;
  let edgeCount = 0;
  let prereqCount = 0;

  for (let ri = 0; ri < ROADMAPS.length; ri++) {
    const roadmap = ROADMAPS[ri];

    db.insert(roadmaps)
      .values({
        id: roadmap.id,
        title: roadmap.title,
        description: roadmap.description,
        sortOrder: ri,
      })
      .onConflictDoUpdate({
        target: roadmaps.id,
        set: {
          title: roadmap.title,
          description: roadmap.description,
          sortOrder: ri,
        },
      })
      .run();

    for (let ni = 0; ni < roadmap.nodes.length; ni++) {
      const node = roadmap.nodes[ni];
      db.insert(roadmapNodes)
        .values({
          id: node.id,
          roadmapId: roadmap.id,
          title: node.title,
          description: node.description,
          category: node.category,
          estimatedDuration: node.estimatedDuration,
          lessonKind: node.lessonInfo?.kind ?? null,
          lessonLabel: node.lessonInfo?.label ?? null,
          lessonHref: node.lessonInfo?.href ?? null,
          posX: node.position.x,
          posY: node.position.y,
          sortOrder: ni,
        })
        .onConflictDoUpdate({
          target: roadmapNodes.id,
          set: {
            roadmapId: roadmap.id,
            title: node.title,
            description: node.description,
            category: node.category,
            estimatedDuration: node.estimatedDuration,
            lessonKind: node.lessonInfo?.kind ?? null,
            lessonLabel: node.lessonInfo?.label ?? null,
            lessonHref: node.lessonInfo?.href ?? null,
            posX: node.position.x,
            posY: node.position.y,
            sortOrder: ni,
          },
        })
        .run();
      nodeCount++;

      db.delete(roadmapNodePrerequisites)
        .where(eq(roadmapNodePrerequisites.nodeId, node.id))
        .run();

      for (const prereqId of node.prerequisiteIds) {
        db.insert(roadmapNodePrerequisites)
          .values({ nodeId: node.id, prerequisiteNodeId: prereqId })
          .onConflictDoNothing()
          .run();
        prereqCount++;
      }
    }

    for (const edge of roadmap.edges) {
      db.insert(roadmapEdges)
        .values({
          id: edge.id,
          roadmapId: roadmap.id,
          sourceNodeId: edge.source,
          targetNodeId: edge.target,
          kind: edge.kind ?? "main",
        })
        .onConflictDoUpdate({
          target: roadmapEdges.id,
          set: {
            roadmapId: roadmap.id,
            sourceNodeId: edge.source,
            targetNodeId: edge.target,
            kind: edge.kind ?? "main",
          },
        })
        .run();
      edgeCount++;
    }
  }

  return { roadmaps: ROADMAPS.length, nodes: nodeCount, edges: edgeCount, prereqs: prereqCount };
}
