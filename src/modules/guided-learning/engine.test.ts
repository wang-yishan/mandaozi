import { describe, expect, it } from "bun:test";
import { getGuidedRecommendation } from "./engine";

describe("guided learning engine", () => {
  it("prioritizes review_required over available", () => {
    const rec = getGuidedRecommendation([
      { id: "a", title: "A", status: "available", order: 0 },
      { id: "b", title: "B", status: "review_required", order: 1 },
    ]);
    expect(rec?.nodeId).toBe("b");
    expect(rec?.actionType).toBe("review");
  });

  it("prioritizes in-progress over available", () => {
    const rec = getGuidedRecommendation([
      { id: "a", title: "A", status: "available", order: 0 },
      { id: "b", title: "B", status: "in_progress", order: 1 },
    ]);
    expect(rec?.nodeId).toBe("b");
  });

  it("returns null when nothing actionable", () => {
    const rec = getGuidedRecommendation([
      { id: "a", title: "A", status: "locked", order: 0 },
      { id: "b", title: "B", status: "mastered", order: 1 },
    ]);
    expect(rec).toBeNull();
  });
});
