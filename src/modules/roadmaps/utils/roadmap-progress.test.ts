import { describe, expect, it } from "bun:test";
import type { RoadmapDef } from "../types/roadmap";
import {
  buildRoadmapNodeVMs,
  getCurrentLearningStage,
  getNextRecommendedNode,
  getRoadmapCompletion,
} from "./roadmap-progress";

const roadmap: RoadmapDef = {
  id: "test",
  title: "Test",
  description: "Test roadmap",
  nodes: [
    {
      id: "a",
      title: "A",
      description: "A",
      category: "foundation",
      estimatedDuration: "5 min",
      prerequisiteIds: [],
      position: { x: 0, y: 0 },
    },
    {
      id: "b",
      title: "B",
      description: "B",
      category: "foundation",
      estimatedDuration: "5 min",
      prerequisiteIds: ["a"],
      position: { x: 0, y: 100 },
    },
    {
      id: "c",
      title: "C",
      description: "C",
      category: "assessment",
      estimatedDuration: "5 min",
      prerequisiteIds: ["b"],
      position: { x: 0, y: 200 },
    },
  ],
  edges: [],
};

describe("roadmap-progress", () => {
  it("computes initial statuses and recommendation", () => {
    const vms = buildRoadmapNodeVMs(roadmap, {
      completedNodeIds: [],
      inProgressNodeId: null,
    });
    expect(vms.map((n) => n.status)).toEqual([
      "recommended",
      "locked",
      "locked",
    ]);
    expect(
      getNextRecommendedNode(roadmap, {
        completedNodeIds: [],
        inProgressNodeId: null,
      })?.id,
    ).toBe("a");
  });

  it("unlocks nodes when prerequisites complete", () => {
    const vms = buildRoadmapNodeVMs(roadmap, {
      completedNodeIds: ["a"],
      inProgressNodeId: null,
    });
    expect(vms.map((n) => n.status)).toEqual([
      "completed",
      "recommended",
      "locked",
    ]);
  });

  it("marks in-progress node", () => {
    const vms = buildRoadmapNodeVMs(roadmap, {
      completedNodeIds: ["a"],
      inProgressNodeId: "b",
    });
    expect(vms.find((n) => n.id === "b")?.status).toBe("in-progress");
  });

  it("computes completion and stage", () => {
    expect(
      getRoadmapCompletion(roadmap, {
        completedNodeIds: ["a", "b"],
        inProgressNodeId: null,
      }),
    ).toEqual({
      completed: 2,
      total: 3,
      percentage: 67,
    });
    expect(
      getCurrentLearningStage(roadmap, {
        completedNodeIds: ["a", "b"],
        inProgressNodeId: null,
      }),
    ).toBe("Assessment Ready");
  });
});
