import { describe, expect, it } from "bun:test";
import { applyCompetencyEvidence, createInitialMastery } from "./engine";

describe("competency mastery engine", () => {
  it("lesson completion does not automatically master competency", () => {
    const base = createInitialMastery("u1", "cmp-1");
    const next = applyCompetencyEvidence(base, {
      userId: "u1",
      competencyId: "cmp-1",
      type: "lesson_completed",
      score: 100,
      sourceId: "lesson-1",
      occurredAt: new Date("2026-01-01T00:00:00Z"),
    });
    expect(next.state).toBe("learning");
    expect(next.state).not.toBe("mastered");
  });

  it("assessment pass can master competency", () => {
    const base = createInitialMastery("u1", "cmp-1");
    const next = applyCompetencyEvidence(base, {
      userId: "u1",
      competencyId: "cmp-1",
      type: "assessment_passed",
      score: 92,
      passed: true,
      sourceId: "attempt-1",
      occurredAt: new Date("2026-01-01T00:00:00Z"),
    });
    expect(next.state).toBe("mastered");
  });

  it("failed assessment after mastery moves to learning (simple retry, no manual review)", () => {
    const mastered = applyCompetencyEvidence(createInitialMastery("u1", "c"), {
      userId: "u1",
      competencyId: "c",
      type: "assessment_passed",
      score: 95,
      passed: true,
      occurredAt: new Date("2026-01-01T00:00:00Z"),
    });
    const afterFail = applyCompetencyEvidence(mastered, {
      userId: "u1",
      competencyId: "c",
      type: "assessment_failed",
      score: 40,
      passed: false,
      occurredAt: new Date("2026-01-02T00:00:00Z"),
    });
    expect(afterFail.state).toBe("learning");
  });
});
