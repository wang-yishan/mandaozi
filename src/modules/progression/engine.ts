import type { ProgressionRule } from "./rule-schema";
import type {
  NodeUnlockEvaluation,
  ProgressionContext,
  RoadmapNodeState,
  RuleEvaluationResult,
} from "./types";

function pass(reason: string, rule: ProgressionRule): RuleEvaluationResult {
  return {
    passed: true,
    reason,
    failedConditions: [],
    satisfiedConditions: [rule],
  };
}

function fail(reason: string, rule: ProgressionRule): RuleEvaluationResult {
  return {
    passed: false,
    reason,
    failedConditions: [rule],
    satisfiedConditions: [],
  };
}

function mergeResults(
  passed: boolean,
  reason: string,
  rule: ProgressionRule,
  children: RuleEvaluationResult[],
): RuleEvaluationResult {
  return {
    passed,
    reason,
    failedConditions: children.flatMap((c) => c.failedConditions),
    satisfiedConditions: passed
      ? [rule, ...children.flatMap((c) => c.satisfiedConditions)]
      : children.flatMap((c) => c.satisfiedConditions),
  };
}

export function evaluateRule(
  rule: ProgressionRule,
  ctx: ProgressionContext,
): RuleEvaluationResult {
  if ("all" in rule) {
    const results = rule.all.map((r) => evaluateRule(r, ctx));
    const passed = results.every((r) => r.passed);
    return mergeResults(
      passed,
      passed
        ? "All conditions satisfied"
        : `Missing ${results.filter((r) => !r.passed).length} required condition(s)`,
      rule,
      results,
    );
  }

  if ("any" in rule) {
    const results = rule.any.map((r) => evaluateRule(r, ctx));
    const passed = results.some((r) => r.passed);
    return mergeResults(
      passed,
      passed
        ? "At least one alternative condition satisfied"
        : "No alternative condition satisfied",
      rule,
      results,
    );
  }

  if ("not" in rule) {
    const inner = evaluateRule(rule.not, ctx);
    return inner.passed
      ? fail("Negated condition was satisfied", rule)
      : pass("Negated condition satisfied", rule);
  }

  if ("nodeCompleted" in rule) {
    const ok = ctx.completedNodeIds.has(rule.nodeCompleted);
    return ok
      ? pass(`Node completed: ${rule.nodeCompleted}`, rule)
      : fail(`Node not completed: ${rule.nodeCompleted}`, rule);
  }

  if ("nodesCompleted" in rule) {
    const { ids, min } = rule.nodesCompleted;
    const count = ids.reduce(
      (acc, id) => acc + (ctx.completedNodeIds.has(id) ? 1 : 0),
      0,
    );
    const ok = count >= min;
    return ok
      ? pass(`Completed ${count}/${min} required nodes`, rule)
      : fail(`Completed ${count}/${min} required nodes`, rule);
  }

  if ("competencyMastered" in rule) {
    const ok = ctx.competencyMasteredIds.has(rule.competencyMastered);
    return ok
      ? pass(`Competency mastered: ${rule.competencyMastered}`, rule)
      : fail(`Competency not mastered: ${rule.competencyMastered}`, rule);
  }

  if ("competencyScoreAtLeast" in rule) {
    const { competencyId, minScore } = rule.competencyScoreAtLeast;
    const score = ctx.competencyScores.get(competencyId) ?? 0;
    const ok = score >= minScore;
    return ok
      ? pass(`Competency ${competencyId} score ${score} >= ${minScore}`, rule)
      : fail(`Competency ${competencyId} score ${score} < ${minScore}`, rule);
  }

  if ("assessmentPassed" in rule) {
    const ok = ctx.passedAssessmentIds.has(rule.assessmentPassed);
    return ok
      ? pass(`Assessment passed: ${rule.assessmentPassed}`, rule)
      : fail(`Assessment not passed: ${rule.assessmentPassed}`, rule);
  }

  if ("assessmentScoreAtLeast" in rule) {
    const { assessmentId, minScore } = rule.assessmentScoreAtLeast;
    const score = ctx.assessmentScores.get(assessmentId) ?? 0;
    const ok = score >= minScore;
    return ok
      ? pass(`Assessment ${assessmentId} score ${score} >= ${minScore}`, rule)
      : fail(`Assessment ${assessmentId} score ${score} < ${minScore}`, rule);
  }

  if ("branchChoice" in rule) {
    const selected = ctx.branchChoices.get(rule.branchChoice.nodeId);
    const ok = selected === rule.branchChoice.choiceId;
    return ok
      ? pass(
          `Branch choice selected: ${rule.branchChoice.nodeId}=${rule.branchChoice.choiceId}`,
          rule,
        )
      : fail(
          `Branch choice missing: ${rule.branchChoice.nodeId}=${rule.branchChoice.choiceId}`,
          rule,
        );
  }

  if ("manualOverride" in rule) {
    return pass("Manual override granted", rule);
  }

  return fail("Unknown rule", rule as ProgressionRule);
}

export function legacyPrerequisiteRule(
  prerequisiteIds: string[],
): ProgressionRule | null {
  if (prerequisiteIds.length === 0) return null;
  if (prerequisiteIds.length === 1) {
    return { nodeCompleted: prerequisiteIds[0] };
  }
  return { all: prerequisiteIds.map((id) => ({ nodeCompleted: id })) };
}

export function evaluateNodeUnlock(args: {
  nodeId: string;
  unlockRule: ProgressionRule | null;
  ctx: ProgressionContext;
  isInProgress?: boolean;
  isCompleted?: boolean;
  isMastered?: boolean;
  isReviewRequired?: boolean;
}): NodeUnlockEvaluation {
  const {
    nodeId,
    unlockRule,
    ctx,
    isInProgress = ctx.inProgressNodeIds.has(nodeId),
    isCompleted = ctx.completedNodeIds.has(nodeId),
    isMastered = ctx.masteredNodeIds?.has(nodeId) ?? false,
    isReviewRequired = ctx.reviewRequiredNodeIds?.has(nodeId) ?? false,
  } = args;

  const evalResult = unlockRule
    ? evaluateRule(unlockRule, ctx)
    : pass("No unlock rule", { manualOverride: true });

  const unlocked = evalResult.passed;

  // Simple auto flow: no manual review state. If unlocked and req passed, progress is automatic.
  let status: RoadmapNodeState;
  if (!unlocked) {
    status = "locked";
  } else if (isMastered) {
    status = "mastered";
  } else if (isCompleted) {
    status = "completed";
  } else if (isInProgress) {
    status = "in_progress";
  } else {
    status = "available";
  }

  const reasons = [evalResult.reason];
  if (!unlocked) reasons.push("Unlock conditions are not satisfied");

  return {
    nodeId,
    status,
    unlocked,
    reasons,
    failedConditions: evalResult.failedConditions,
    satisfiedConditions: evalResult.satisfiedConditions,
  };
}
