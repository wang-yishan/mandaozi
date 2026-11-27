import { describe, expect, it } from "bun:test";
import type { RoadmapDef } from "../types/roadmap";
import {
  applyNodeVariant,
  buildDaoRoadmap,
  getDaoActiveNodeIds,
  getSelectedChoice,
} from "./roadmap-choices";
import { getRoadmapCompletion } from "./roadmap-progress";

const roadmap: RoadmapDef = {
  id: "r1",
  title: "R1",
  description: "test",
  nodes: [
    {
      id: "a",
      title: "A",
      description: "A",
      category: "foundation",
      estimatedDuration: "5 min",
      prerequisiteIds: [],
      choices: [
        {
          id: "a1",
          label: "A1",
          variant: { title: "A Varian", estimatedDuration: "7 min" },
          excludesNodeIds: ["c"],
        },
        {
          id: "a2",
          label: "A2",
          includesNodeIds: ["b"],
          nextNodeIds: ["d"],
        },
      ],
      position: { x: 0, y: 0 },
    },
    {
      id: "b",
      title: "B",
      description: "B",
      category: "foundation",
      estimatedDuration: "5 min",
      prerequisiteIds: ["a"],
      position: { x: 0, y: 1 },
    },
    {
      id: "c",
      title: "C",
      description: "C",
      category: "practice",
      estimatedDuration: "5 min",
      prerequisiteIds: ["a"],
      position: { x: 0, y: 2 },
    },
    {
      id: "d",
      title: "D",
      description: "D",
      category: "milestone",
      estimatedDuration: "5 min",
      prerequisiteIds: ["b", "c"],
      position: { x: 0, y: 3 },
    },
  ],
  edges: [
    { id: "ab", source: "a", target: "b" },
    { id: "ac", source: "a", target: "c" },
    { id: "bd", source: "b", target: "d" },
    { id: "cd", source: "c", target: "d" },
  ],
};

describe("roadmap-choices", () => {
  it("returns selected choice and null by default/reset", () => {
    expect(getSelectedChoice(roadmap.nodes[0], {})).toBeNull();
    expect(getSelectedChoice(roadmap.nodes[0], { a: "a1" })?.id).toBe("a1");
    expect(getSelectedChoice(roadmap.nodes[0], { a: "missing" })).toBeNull();
  });

  it("applies Varian Node only as data overlay", () => {
    const original = roadmap.nodes[0];
    const variant = applyNodeVariant(original, { a: "a1" });
    expect(variant.title).toBe("A Varian");
    expect(variant.estimatedDuration).toBe("7 min");
    expect(original.title).toBe("A"); // node asli tidak berubah
  });

  it("default without choice keeps all nodes in Dao", () => {
    const ids = [...getDaoActiveNodeIds(roadmap, {})].sort();
    expect(ids).toEqual(["a", "b", "c", "d"]);
  });

  it("excludesNodeIds hides nodes in Dao only and prunes prereqs", () => {
    const dao = buildDaoRoadmap(roadmap, { a: "a1" }); // excludes c
    expect(dao.nodes.map((n) => n.id)).toEqual(["a", "b", "d"]);
    expect(dao.edges.map((e) => e.id).sort()).toEqual(["ab", "bd"]);
    const d = dao.nodes.find((n) => n.id === "d");
    expect(d?.prerequisiteIds).toEqual(["b"]); // c dipangkas, tidak memblokir
  });

  it("includesNodeIds limits Dao nodes, keeps source/prereq chain, and adds next", () => {
    const dao = buildDaoRoadmap(roadmap, { a: "a2" }); // includes b, next d, source a
    expect(dao.nodes.map((n) => n.id)).toEqual(["a", "b", "d"]);
    expect(dao.nodes.find((n) => n.id === "d")?.prerequisiteIds).toEqual(["b"]);
  });

  it("choice-aware completion uses filtered Dao roadmap", () => {
    const dao = buildDaoRoadmap(roadmap, { a: "a1" }); // a,b,d
    expect(
      getRoadmapCompletion(dao, {
        completedNodeIds: ["a", "b"],
        inProgressNodeId: null,
      }),
    ).toEqual({ completed: 2, total: 3, percentage: 67, isCompleted: false });
    expect(
      getRoadmapCompletion(dao, {
        completedNodeIds: ["a", "b", "d"],
        inProgressNodeId: null,
      }),
    ).toEqual({ completed: 3, total: 3, percentage: 100, isCompleted: true });
    // node c completed di progress tidak dihitung karena di luar Dao
    expect(
      getRoadmapCompletion(dao, {
        completedNodeIds: ["a", "b", "c", "d"],
        inProgressNodeId: null,
      }),
    ).toEqual({ completed: 3, total: 3, percentage: 100, isCompleted: true });
  });
});
