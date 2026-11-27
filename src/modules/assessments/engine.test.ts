import { describe, expect, it } from "bun:test";
import { submitAssessmentAttempt } from "./engine";

describe("assessment engine", () => {
  it("grades attempt and emits passed evidence", () => {
    const result = submitAssessmentAttempt({
      attemptId: "att-1",
      userId: "u1",
      assessment: {
        id: "asm-1",
        title: "Quiz",
        kind: "quiz",
        mode: "auto",
        maxScore: 100,
        passScore: 70,
        competencyIds: ["cmp-1", "cmp-2"],
      },
      score: 85,
      submittedAt: new Date("2026-01-01T00:00:00Z"),
    });

    expect(result.attempt.status).toBe("graded");
    expect(result.attempt.passed).toBe(true);
    expect(result.evidence).toHaveLength(2);
    expect(result.evidence.every((e) => e.type === "assessment_passed")).toBe(
      true,
    );
  });

  it("failed assessment emits failed evidence (not mastery)", () => {
    const result = submitAssessmentAttempt({
      attemptId: "att-2",
      userId: "u1",
      assessment: {
        id: "asm-1",
        title: "Quiz",
        kind: "quiz",
        mode: "auto",
        maxScore: 100,
        passScore: 70,
        competencyIds: ["cmp-1"],
      },
      score: 40,
    });
    expect(result.attempt.passed).toBe(false);
    expect(result.evidence[0]?.type).toBe("assessment_failed");
    expect(result.evidence[0]?.passed).toBe(false);
  });
});
