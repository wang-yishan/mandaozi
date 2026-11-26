export type RoadmapNodeStatus =
  | "completed"
  | "in-progress"
  | "available"
  | "locked"
  | "recommended";

export type RoadmapNodeCategory =
  | "foundation"
  | "vocabulary"
  | "grammar"
  | "practice"
  | "assessment"
  | "milestone";

export type RoadmapLessonKind = "lesson" | "practice" | "assessment";

export interface RoadmapNodeLessonInfo {
  label: string;
  kind: RoadmapLessonKind;
  /** Optional - links can be added manually later. */
  href?: string;
}

export interface RoadmapNodeDef {
  id: string;
  title: string;
  description: string;
  category: RoadmapNodeCategory;
  estimatedDuration: string;
  prerequisiteIds: string[];
  lessonInfo?: RoadmapNodeLessonInfo;
  position: { x: number; y: number };
}

export interface RoadmapEdgeDef {
  id: string;
  source: string;
  target: string;
  kind?: "main" | "branch";
}

export interface RoadmapDef {
  id: string;
  title: string;
  description: string;
  nodes: RoadmapNodeDef[];
  edges: RoadmapEdgeDef[];
}

export interface RoadmapProgress {
  completedNodeIds: string[];
  inProgressNodeId: string | null;
}

export interface RoadmapNodeVM extends RoadmapNodeDef {
  status: RoadmapNodeStatus;
  prerequisites: Array<{ id: string; title: string; completed: boolean }>;
}
