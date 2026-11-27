import type { RoadmapNodeState } from "@/modules/progression/types";

export type GuidedActionType = "learn" | "practice" | "assess" | "review";

export type GuidedNodeStatus = RoadmapNodeState | "recommended" | "in-progress";

export interface GuidedNodeInput {
  id: string;
  title: string;
  status: GuidedNodeStatus;
  estimatedDuration?: string;
  lessonKind?: "lesson" | "practice" | "assessment";
  lessonHref?: string;
  isMilestone?: boolean;
  order: number;
}

export interface GuidedRecommendation {
  nodeId: string;
  title: string;
  reason: string;
  actionType: GuidedActionType;
  href?: string;
  estimatedDuration?: string;
}
