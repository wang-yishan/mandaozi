import { describe, expect, it } from "bun:test";
import {
  evaluateNodeUnlock,
  evaluateRule,
  legacyPrerequisiteRule,
} from "./engine";
import type { ProgressionContext } from "./types";

function emptyCtx(): ProgressionContext {
  return {
    completedNodeIds: new Set(),
    inProgressNodeIds: new Set(),
    masteredNodeIds: new Set(),
    reviewRequiredNodeIds: new Set(),
    competencyMasteredIds: new Set(),
    competencyScores: new Map(),
    passedAssessmentIds: new Set(),
    assessmentScores: new Map(),
    branchChoices: new Map(),
  };
}

describe("progression engine", () => {
  it("evaluates AND rules", () => {
    const ctx = emptyCtx();
    ctx.completedNodeIds.add("a");
    const result = evaluateRule(
      { all: [{ nodeCompleted: "a" }, { nodeCompleted: "b" }] },
      ctx,
    );
    expect(result.passed).toBe(false);
    ctx.completedNodeIds.add("b");
    expect(
      evaluateRule(
        { all: [{ nodeCompleted: "a" }, { nodeCompleted: "b" }] },
        ctx,
      ).passed,
    ).toBe(true);
  });

  it("evaluates OR rules (alternative path)", () => {
    const ctx = emptyCtx();
    ctx.completedNodeIds.add("path-b");
    const result = evaluateRule(
      { any: [{ nodeCompleted: "path-a" }, { nodeCompleted: "path-b" }] },
      ctx,
    );
    expect(result.passed).toBe(true);
  });

  it("evaluates threshold node completion", () => {
    const ctx = emptyCtx();
    ctx.completedNodeIds.add("n1");
    ctx.completedNodeIds.add("n2");
    expect(
      evaluateRule({ nodesCompleted: { ids: ["n1", "n2", "n3"], min: 2 } }, ctx)
        .passed,
    ).toBe(true);
    expect(
      evaluateRule({ nodesCompleted: { ids: ["n1", "n2", "n3"], min: 3 } }, ctx)
        .passed,
    ).toBe(false);
  });

  it("evaluates assessment and competency rules", () => {
    const ctx = emptyCtx();
    ctx.passedAssessmentIds.add("asm-1");
    ctx.assessmentScores.set("asm-2", 82);
    ctx.competencyMasteredIds.add("cmp-1");
    ctx.competencyScores.set("cmp-2", 75);

    expect(evaluateRule({ assessmentPassed: "asm-1" }, ctx).passed).toBe(true);
    expect(
      evaluateRule(
        { assessmentScoreAtLeast: { assessmentId: "asm-2", minScore: 80 } },
        ctx,
      ).passed,
    ).toBe(true);
    expect(evaluateRule({ competencyMastered: "cmp-1" }, ctx).passed).toBe(
      true,
    );
    expect(
      evaluateRule(
        { competencyScoreAtLeast: { competencyId: "cmp-2", minScore: 90 } },
        ctx,
      ).passed,
    ).toBe(false);
  });

  it("evaluates branch choice rules", () => {
    const ctx = emptyCtx();
    ctx.branchChoices.set("node-x", "choice-a");
    expect(
      evaluateRule(
        { branchChoice: { nodeId: "node-x", choiceId: "choice-a" } },
        ctx,
      ).passed,
    ).toBe(true);
    expect(
      evaluateRule(
        { branchChoice: { nodeId: "node-x", choiceId: "choice-b" } },
        ctx,
      ).passed,
    ).toBe(false);
  });

  it("adapts legacy prerequisiteIds as AND rule", () => {
    expect(legacyPrerequisiteRule([])).toBeNull();
    expect(legacyPrerequisiteRule(["a"])).toEqual({ nodeCompleted: "a" });
    expect(legacyPrerequisiteRule(["a", "b"])).toEqual({
      all: [{ nodeCompleted: "a" }, { nodeCompleted: "b" }],
    });
  });

  it("resolves node status with unlock + progress + mastery + review", () => {
    const ctx = emptyCtx();
    ctx.completedNodeIds.add("prereq");
    const unlockRule = legacyPrerequisiteRule(["prereq"]);

    const locked = evaluateNodeUnlock({
      nodeId: "n1",
      unlockRule: legacyPrerequisiteRule(["missing"]),
      ctx,
    });
    expect(locked.status).toBe("locked");
    expect(locked.unlocked).toBe(false);

    const available = evaluateNodeUnlock({ nodeId: "n1", unlockRule, ctx });
    expect(available.status).toBe("available");

    ctx.inProgressNodeIds.add("n1");
    expect(evaluateNodeUnlock({ nodeId: "n1", unlockRule, ctx }).status).toBe(
      "in_progress",
    );

    ctx.completedNodeIds.add("n1");
    expect(evaluateNodeUnlock({ nodeId: "n1", unlockRule, ctx }).status).toBe(
      "completed",
    );

    ctx.masteredNodeIds?.add("n1");
    expect(evaluateNodeUnlock({ nodeId: "n1", unlockRule, ctx }).status).toBe(
      "mastered",
    );

    // Simple auto flow: no manual review state; mastered takes precedence.
    ctx.reviewRequiredNodeIds?.add("n1");
    expect(evaluateNodeUnlock({ nodeId: "n1", unlockRule, ctx }).status).toBe(
      "mastered",
    );
  });
});
