import { describe, expect, it } from "bun:test";
import { buildMasteryHref, fallbackLearningItemIdForNode } from "./mastery-href";

describe("mastery href", () => {
  it("builds stable href with encoded learningItemId and roadmap context", () => {
    expect(
      buildMasteryHref("li:node:n1", { roadmapId: "r1", nodeId: "n1" }),
    ).toBe("/mastery/li%3Anode%3An1?roadmapId=r1&nodeId=n1");
  });

  it("includes optional context params", () => {
    const href = buildMasteryHref("li:x", {
      roadmapId: "r1",
      nodeId: "n1",
      choiceNodeId: "n1",
      choiceId: "c1",
      returnTo: "/roadmaps",
    });
    expect(href).toContain("choiceNodeId=n1");
    expect(href).toContain("choiceId=c1");
    expect(href).toContain("returnTo=%2Froadmaps");
  });

  it("falls back deterministically per node", () => {
    expect(fallbackLearningItemIdForNode("n-1")).toBe("li:node:n-1");
  });
});
