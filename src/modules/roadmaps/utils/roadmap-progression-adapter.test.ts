import { describe, expect, it } from "bun:test";
import type { RoadmapDef } from "../types/roadmap";
import { buildRoadmapNodeVMsWithProgression } from "./roadmap-progression-adapter";

const roadmap: RoadmapDef = {
  id: "r1",
  title: "R1",
  description: "desc",
  nodes: [
    {
      id: "a",
      title: "A",
      description: "A",
      category: "foundation",
      estimatedDuration: "10m",
      prerequisiteIds: [],
      position: { x: 0, y: 0 },
    },
    {
      id: "b",
      title: "B",
      description: "B",
      category: "foundation",
      estimatedDuration: "10m",
      prerequisiteIds: ["a"],
      position: { x: 0, y: 100 },
    },
    {
      id: "c",
      title: "C",
      description: "C",
      category: "assessment",
      estimatedDuration: "10m",
      prerequisiteIds: ["b"],
      position: { x: 0, y: 200 },
    },
  ],
  edges: [],
};

describe("roadmap progression adapter", () => {
  it("falls back to legacy prerequisiteIds when no rules provided", () => {
    const vms = buildRoadmapNodeVMsWithProgression(roadmap, {
      completedNodeIds: ["a"],
      inProgressNodeId: null,
    });
    expect(vms.map((n) => n.status)).toEqual([
      "completed",
      "recommended",
      "locked",
    ]);
  });

  it("supports explicit unlock rules with branch choice", () => {
    const vms = buildRoadmapNodeVMsWithProgression(
      roadmap,
      { completedNodeIds: ["a"], inProgressNodeId: null },
      {
        unlockRulesByNodeId: {
          a: null,
          b: { branchChoice: { nodeId: "a", choiceId: "fast" } },
          c: { nodeCompleted: "b" },
        },
        branchChoices: { a: "fast" },
      },
    );
    expect(vms.find((n) => n.id === "b")?.status).toBe("recommended");
    expect(vms.find((n) => n.id === "c")?.status).toBe("locked");
  });

  it("supports assessment-based unlock", () => {
    const vms = buildRoadmapNodeVMsWithProgression(
      roadmap,
      { completedNodeIds: ["a"], inProgressNodeId: null },
      {
        unlockRulesByNodeId: {
          a: null,
          b: { assessmentPassed: "asm-1" },
          c: { nodeCompleted: "b" },
        },
        passedAssessmentIds: ["asm-1"],
      },
    );
    expect(vms.find((n) => n.id === "b")?.status).toBe("recommended");
  });

  it("maps mastered state; review_required is simplified to normal flow (no manual review)", () => {
    const vms = buildRoadmapNodeVMsWithProgression(
      roadmap,
      { completedNodeIds: ["a", "b"], inProgressNodeId: null },
      {
        masteredNodeIds: ["a"],
        reviewRequiredNodeIds: ["b"],
      },
    );
    expect(vms.find((n) => n.id === "a")?.status).toBe("mastered");
    // Simple flow: no manual review state; completed node stays completed.
    expect(vms.find((n) => n.id === "b")?.status).toBe("completed");
  });

  it("populates competencies/resources/assessments enrichment", () => {
    const vms = buildRoadmapNodeVMsWithProgression(
      roadmap,
      { completedNodeIds: [], inProgressNodeId: null },
      {
        nodeCompetenciesByNodeId: {
          a: [{ id: "cmp-1", title: "Pinyin" }],
        },
        nodeResourcesByNodeId: {
          a: [
            {
              id: "li-1",
              title: "Lesson 1",
              kind: "lesson",
              href: "/x",
              role: "learn",
            },
          ],
        },
        nodeAssessmentsByNodeId: {
          a: [
            {
              id: "asm-1",
              title: "Quiz 1",
              passed: true,
              lastScore: 90,
              maxScore: 100,
            },
          ],
        },
        competencyMasteredIds: ["cmp-1"],
        competencyScores: { "cmp-1": 95 },
      },
    );
    const a = vms.find((n) => n.id === "a");
    expect(a?.competencies?.[0]?.state).toBe("mastered");
    expect(a?.resources?.[0]?.href).toBe("/x");
    expect(a?.assessments?.[0]?.passed).toBe(true);
    expect(a?.masteryState).toBe("mastered");
  });

  it("maps legacy review_required competency state to learning (simple retry, no manual review)", () => {
    const vms = buildRoadmapNodeVMsWithProgression(
      roadmap,
      { completedNodeIds: ["a"], inProgressNodeId: null },
      {
        nodeCompetenciesByNodeId: {
          a: [
            { id: "cmp-1", title: "C1" },
            { id: "cmp-2", title: "C2" },
          ],
        },
        competencyStates: {
          "cmp-1": "mastered",
          "cmp-2": "review_required",
        },
        competencyScores: { "cmp-1": 90, "cmp-2": 40 },
      },
    );
    const a = vms.find((n) => n.id === "a");
    expect(a?.competencies?.find((c) => c.id === "cmp-2")?.state).toBe(
      "learning",
    );
    expect(a?.masteryState).toBe("learning");
  });
});
