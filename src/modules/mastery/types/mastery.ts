import type { RoadmapNodeVM } from "@/modules/roadmaps/types/roadmap";

export interface MasteryCardProgress {
  status: "not_started" | "in_progress" | "completed";
  completedAt?: string | null;
}

export interface MasteryRoadmapContext {
  roadmapId: string;
  roadmapTitle: string;
  nodeId: string;
  nodeTitle: string;
  status: string;
  prerequisites: RoadmapNodeVM["prerequisites"];
  unlockRule?: unknown;
  failedConditions?: unknown[];
  satisfiedConditions?: unknown[];
  canOpen: boolean;
  canComplete: boolean;
}

export interface MasteryRoadmapOccurrence {
  roadmapId: string;
  roadmapTitle: string;
  nodeId: string;
  nodeTitle: string;
  prerequisites: RoadmapNodeVM["prerequisites"];
  masteryHref: string;
}

export interface MasteryCardVM {
  learningItemId: string;
  title: string;
  description: string;
  kind: string;
  sourceType: string;
  sourceHref?: string;
  estimatedMin?: number | null;
  roadmapContext?: MasteryRoadmapContext;
  roadmapOccurrences: MasteryRoadmapOccurrence[];
  progress?: MasteryCardProgress;
  competencyIds?: string[];
  assessmentIds?: string[];
  resources?: Array<{
    id: string;
    title: string;
    kind: string;
    href?: string;
    role: string;
  }>;
  assessments?: Array<{
    id: string;
    title: string;
    kind?: string;
    passed?: boolean | null;
    lastScore?: number | null;
    maxScore?: number | null;
  }>;
}
