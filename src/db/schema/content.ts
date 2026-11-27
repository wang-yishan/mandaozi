import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";

export const vocabularyWords = sqliteTable(
  "vocabulary_words",
  {
    id: text("id").primaryKey(),
    hanzi: text("hanzi").notNull(),
    pinyin: text("pinyin").notNull(),
    meaningEn: text("meaning_en").notNull(),
    meaningId: text("meaning_id").notNull(),
    hskLevel: text("hsk_level").notNull(),
    exampleHanzi: text("example_hanzi").notNull(),
    exampleMeaningId: text("example_meaning_id").notNull(),
    audioUrl: text("audio_url"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [
    unique("vocabulary_words_hanzi_uq").on(t.hanzi),
    index("vocabulary_words_hsk_idx").on(t.hskLevel),
  ],
);

export const worldCategories = sqliteTable("world_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  hanzi: text("hanzi").notNull(),
  subtitlePinyin: text("subtitle_pinyin").notNull(),
  description: text("description").notNull(),
  xp: integer("xp").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const worldCategoryLessons = sqliteTable(
  "world_category_lessons",
  {
    id: text("id").primaryKey(),
    categoryId: text("category_id")
      .notNull()
      .references(() => worldCategories.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    kind: text("kind").notNull().default("lesson"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("world_category_lessons_category_idx").on(t.categoryId)],
);

export const worldToneOptions = sqliteTable("world_tone_options", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const roadmaps = sqliteTable("roadmaps", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  /** JSON string of RoadmapSilabusDef (silabus per roadmap). */
  silabusJson: text("silabus_json"),
  /** Opsional: kaitan ke World category. */
  worldCategoryId: text("world_category_id"),
});

export const roadmapNodes = sqliteTable(
  "roadmap_nodes",
  {
    id: text("id").primaryKey(),
    roadmapId: text("roadmap_id")
      .notNull()
      .references(() => roadmaps.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    estimatedDuration: text("estimated_duration").notNull(),
    lessonKind: text("lesson_kind"),
    lessonLabel: text("lesson_label"),
    lessonHref: text("lesson_href"),
    posX: real("pos_x").notNull(),
    posY: real("pos_y").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("roadmap_nodes_roadmap_idx").on(t.roadmapId)],
);

export const roadmapNodePrerequisites = sqliteTable(
  "roadmap_node_prerequisites",
  {
    nodeId: text("node_id")
      .notNull()
      .references(() => roadmapNodes.id, { onDelete: "cascade" }),
    prerequisiteNodeId: text("prerequisite_node_id")
      .notNull()
      .references(() => roadmapNodes.id, { onDelete: "cascade" }),
  },
  (t) => [
    index("roadmap_node_prereq_node_idx").on(t.nodeId),
    index("roadmap_node_prereq_prereq_idx").on(t.prerequisiteNodeId),
    unique("roadmap_node_prereq_uq").on(t.nodeId, t.prerequisiteNodeId),
  ],
);

export const roadmapEdges = sqliteTable(
  "roadmap_edges",
  {
    id: text("id").primaryKey(),
    roadmapId: text("roadmap_id")
      .notNull()
      .references(() => roadmaps.id, { onDelete: "cascade" }),
    sourceNodeId: text("source_node_id")
      .notNull()
      .references(() => roadmapNodes.id, { onDelete: "cascade" }),
    targetNodeId: text("target_node_id")
      .notNull()
      .references(() => roadmapNodes.id, { onDelete: "cascade" }),
    kind: text("kind").notNull().default("main"),
  },
  (t) => [
    index("roadmap_edges_roadmap_idx").on(t.roadmapId),
    index("roadmap_edges_source_idx").on(t.sourceNodeId),
    index("roadmap_edges_target_idx").on(t.targetNodeId),
  ],
);
