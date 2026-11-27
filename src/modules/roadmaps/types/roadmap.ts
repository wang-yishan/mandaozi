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

export interface RoadmapNodeLessonInfoVariant {
  label?: string;
  kind?: RoadmapLessonKind;
  href?: string;
}

export interface RoadmapNodeChoiceVariant {
  title?: string;
  description?: string;
  estimatedDuration?: string;
  lessonInfo?: RoadmapNodeLessonInfoVariant;
}

export interface RoadmapNodeChoice {
  id: string; // unik per node
  label: string; // label varian
  description?: string;

  // === Varian Node (inti) ===
  variant?: RoadmapNodeChoiceVariant;

  // === Pengkondisian arah pembelajaran (DAO saja) ===
  /** Kalau diisi: batasi Dao ke node-node ini. */
  includesNodeIds?: string[];
  /** Sembunyikan node-node ini di Dao. */
  excludesNodeIds?: string[];
  /** Pastikan lanjutan ini aktif di Dao. */
  nextNodeIds?: string[];
}

export interface RoadmapNodeDef {
  id: string;
  title: string;
  description: string;
  category: RoadmapNodeCategory;
  estimatedDuration: string;
  prerequisiteIds: string[];
  lessonInfo?: RoadmapNodeLessonInfo;
  /** Pilihan/varian node; opsional. Roadmap diagram tetap menampilkan semua node. */
  choices?: RoadmapNodeChoice[];
  position: { x: number; y: number };
}

export interface RoadmapEdgeDef {
  id: string;
  source: string;
  target: string;
  kind?: "main" | "branch";
}

export interface RoadmapSilabusSection {
  id: string;
  title: string;
  items: string[];
}

export interface RoadmapSilabusDef {
  overview?: string;
  objectives: string[];
  sections: RoadmapSilabusSection[];
  materials?: string[];
  assessment?: string;
  estimatedDuration?: string;
}

export interface RoadmapDef {
  id: string;
  title: string;
  description: string;
  nodes: RoadmapNodeDef[];
  edges: RoadmapEdgeDef[];
  /** Silabus per roadmap (ikut roadmap yang dipilih). */
  silabus?: RoadmapSilabusDef;
  /** Opsional: kaitan ke World category untuk kesinambungan path. */
  worldCategoryId?: string;
}

export interface RoadmapProgress {
  completedNodeIds: string[];
  inProgressNodeId: string | null;
}

export interface RoadmapNodeVM extends RoadmapNodeDef {
  status: RoadmapNodeStatus;
  prerequisites: Array<{ id: string; title: string; completed: boolean }>;
}

/** Pilihan node per user: nodeId -> choiceId. */
export type RoadmapChoiceSelection = Record<string, string>;
/** Pilihan per roadmap: roadmapId -> selection. */
export type RoadmapChoiceById = Record<string, RoadmapChoiceSelection>;
