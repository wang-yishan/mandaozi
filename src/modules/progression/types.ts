import type { ProgressionRule } from "./rule-schema";

export type RoadmapNodeState =
  | "locked"
  | "available"
  | "in_progress"
  | "completed"
  | "mastered"
  | "review_required";

export interface ProgressionContext {
  completedNodeIds: ReadonlySet<string>;
  inProgressNodeIds: ReadonlySet<string>;
  masteredNodeIds?: ReadonlySet<string>;
  reviewRequiredNodeIds?: ReadonlySet<string>;
  competencyMasteredIds: ReadonlySet<string>;
  competencyScores: ReadonlyMap<string, number>;
  passedAssessmentIds: ReadonlySet<string>;
  assessmentScores: ReadonlyMap<string, number>;
  branchChoices: ReadonlyMap<string, string>; // choiceNodeId -> choiceId
}

export interface RuleEvaluationResult {
  passed: boolean;
  reason: string;
  failedConditions: ProgressionRule[];
  satisfiedConditions: ProgressionRule[];
}

export interface NodeUnlockEvaluation {
  nodeId: string;
  status: RoadmapNodeState;
  unlocked: boolean;
  reasons: string[];
  failedConditions: ProgressionRule[];
  satisfiedConditions: ProgressionRule[];
}

export interface RoadmapNodeRuleDef {
  nodeId: string;
  ruleType: "unlock" | "recommend" | "review";
  rule: ProgressionRule;
  priority?: number;
}
