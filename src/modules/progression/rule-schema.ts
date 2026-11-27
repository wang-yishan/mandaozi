import { z } from "zod";

export type ProgressionRule =
  | { all: ProgressionRule[] }
  | { any: ProgressionRule[] }
  | { not: ProgressionRule }
  | { nodeCompleted: string }
  | { nodesCompleted: { ids: string[]; min: number } }
  | { competencyMastered: string }
  | { competencyScoreAtLeast: { competencyId: string; minScore: number } }
  | { assessmentPassed: string }
  | { assessmentScoreAtLeast: { assessmentId: string; minScore: number } }
  | { branchChoice: { nodeId: string; choiceId: string } }
  | { manualOverride: true };

export const progressionRuleSchema: z.ZodType<ProgressionRule> = z.lazy(() =>
  z.union([
    z.object({ all: z.array(progressionRuleSchema).min(1) }),
    z.object({ any: z.array(progressionRuleSchema).min(1) }),
    z.object({ not: progressionRuleSchema }),
    z.object({ nodeCompleted: z.string().min(1) }),
    z.object({
      nodesCompleted: z.object({
        ids: z.array(z.string().min(1)).min(1),
        min: z.number().int().min(1),
      }),
    }),
    z.object({ competencyMastered: z.string().min(1) }),
    z.object({
      competencyScoreAtLeast: z.object({
        competencyId: z.string().min(1),
        minScore: z.number().min(0).max(100),
      }),
    }),
    z.object({ assessmentPassed: z.string().min(1) }),
    z.object({
      assessmentScoreAtLeast: z.object({
        assessmentId: z.string().min(1),
        minScore: z.number().min(0).max(100),
      }),
    }),
    z.object({
      branchChoice: z.object({
        nodeId: z.string().min(1),
        choiceId: z.string().min(1),
      }),
    }),
    z.object({ manualOverride: z.literal(true) }),
  ]),
);

export type ProgressionRuleInput = z.input<typeof progressionRuleSchema>;
