import { describe, expect, it } from "bun:test";
import { submitAssessmentAttempt } from "@/modules/assessments/engine";
import {
  applyCompetencyEvidence,
  createInitialMastery,
} from "@/modules/competencies/engine";

describe("assessment -> competency mastery flow", () => {
  it("lesson completion does not master, assessment pass/fail updates mastery", () => {
    // Lesson completion evidence: should move to learning, NOT mastered.
    const afterLesson = applyCompetencyEvidence(
      createInitialMastery("u1", "cmp-1"),
      {
        userId: "u1",
        competencyId: "cmp-1",
        type: "lesson_completed",
        score: 100,
        sourceId: "lesson-1",
        occurredAt: new Date("2026-01-01T00:00:00Z"),
      },
    );
    expect(afterLesson.state).toBe("learning");
    expect(afterLesson.state).not.toBe("mastered");

    // Assessment pass: emits evidence that can master.
    const pass = submitAssessmentAttempt({
      attemptId: "att-pass",
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
      score: 90,
      submittedAt: new Date("2026-01-02T00:00:00Z"),
    });
    expect(pass.attempt.passed).toBe(true);
    expect(pass.evidence[0]?.type).toBe("assessment_passed");

    const passEvidence = pass.evidence[0];
    expect(passEvidence).toBeDefined();
    if (!passEvidence) throw new Error("missing pass evidence");
    const afterPass = applyCompetencyEvidence(afterLesson, passEvidence);
    expect(afterPass.state).toBe("mastered");

    // Assessment fail after mastery: simple retry flow, no manual review.
    const fail = submitAssessmentAttempt({
      attemptId: "att-fail",
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
      score: 35,
      submittedAt: new Date("2026-01-03T00:00:00Z"),
    });
    expect(fail.attempt.passed).toBe(false);
    const failEvidence = fail.evidence[0];
    expect(failEvidence).toBeDefined();
    if (!failEvidence) throw new Error("missing fail evidence");
    expect(failEvidence.type).toBe("assessment_failed");

    const afterFail = applyCompetencyEvidence(afterPass, failEvidence);
    expect(afterFail.state).toBe("learning");
  });
});
