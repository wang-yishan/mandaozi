import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  unique,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { roadmapNodes, roadmaps } from "./content";
import { users } from "./users";

export const competencies = sqliteTable(
  "competencies",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    domain: text("domain").notNull().default("general"),
    levelBand: text("level_band"),
    rubricJson: text("rubric_json", { mode: "json" }),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [
    unique("competencies_slug_uq").on(t.slug),
    index("competencies_domain_idx").on(t.domain),
    index("competencies_active_idx").on(t.active),
  ],
);

export const learningItems = sqliteTable(
  "learning_items",
  {
    id: text("id").primaryKey(),
    kind: text("kind").notNull(), // lesson|practice|vocabulary|video|article|assessment|audio|other
    title: text("title").notNull(),
    sourceType: text("source_type").notNull(), // internal_route|world_lesson|phonics|vocabulary|external|content
    sourceRef: text("source_ref").notNull(), // href, content id, etc.
    estimatedMin: integer("estimated_min"),
    metaJson: text("meta_json", { mode: "json" }),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [
    index("learning_items_kind_idx").on(t.kind),
    index("learning_items_source_type_idx").on(t.sourceType),
    index("learning_items_active_idx").on(t.active),
  ],
);

export const learningItemCompetencies = sqliteTable(
  "learning_item_competencies",
  {
    learningItemId: text("learning_item_id")
      .notNull()
      .references(() => learningItems.id, { onDelete: "cascade" }),
    competencyId: text("competency_id")
      .notNull()
      .references(() => competencies.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("teaches"), // teaches|reinforces|assesses
    weight: real("weight").notNull().default(1),
  },
  (t) => [
    primaryKey({
      columns: [t.learningItemId, t.competencyId, t.role],
      name: "learning_item_competencies_pk",
    }),
    index("learning_item_competencies_item_idx").on(t.learningItemId),
    index("learning_item_competencies_comp_idx").on(t.competencyId),
  ],
);

export const assessments = sqliteTable(
  "assessments",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    kind: text("kind").notNull(), // quiz|oral|written|project|rubric
    mode: text("mode").notNull().default("auto"), // auto|manual|hybrid
    maxScore: integer("max_score").notNull().default(100),
    passScore: integer("pass_score").notNull().default(70),
    configJson: text("config_json", { mode: "json" }),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [
    index("assessments_kind_idx").on(t.kind),
    index("assessments_active_idx").on(t.active),
  ],
);

export const assessmentCompetencies = sqliteTable(
  "assessment_competencies",
  {
    assessmentId: text("assessment_id")
      .notNull()
      .references(() => assessments.id, { onDelete: "cascade" }),
    competencyId: text("competency_id")
      .notNull()
      .references(() => competencies.id, { onDelete: "cascade" }),
    weight: real("weight").notNull().default(1),
    minScore: integer("min_score"),
  },
  (t) => [
    primaryKey({
      columns: [t.assessmentId, t.competencyId],
      name: "assessment_competencies_pk",
    }),
    index("assessment_competencies_assessment_idx").on(t.assessmentId),
    index("assessment_competencies_comp_idx").on(t.competencyId),
  ],
);

export const roadmapNodeCompetencies = sqliteTable(
  "roadmap_node_competencies",
  {
    nodeId: text("node_id")
      .notNull()
      .references(() => roadmapNodes.id, { onDelete: "cascade" }),
    competencyId: text("competency_id")
      .notNull()
      .references(() => competencies.id, { onDelete: "cascade" }),
    relation: text("relation").notNull().default("primary"), // primary|secondary
    weight: real("weight").notNull().default(1),
  },
  (t) => [
    primaryKey({
      columns: [t.nodeId, t.competencyId],
      name: "roadmap_node_competencies_pk",
    }),
    index("roadmap_node_competencies_node_idx").on(t.nodeId),
    index("roadmap_node_competencies_comp_idx").on(t.competencyId),
  ],
);

export const roadmapNodeResources = sqliteTable(
  "roadmap_node_resources",
  {
    nodeId: text("node_id")
      .notNull()
      .references(() => roadmapNodes.id, { onDelete: "cascade" }),
    learningItemId: text("learning_item_id")
      .notNull()
      .references(() => learningItems.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("learn"), // learn|practice|review|assessment
    sortOrder: integer("sort_order").notNull().default(0),
    unlockRuleJson: text("unlock_rule_json", { mode: "json" }),
  },
  (t) => [
    primaryKey({
      columns: [t.nodeId, t.learningItemId, t.role],
      name: "roadmap_node_resources_pk",
    }),
    index("roadmap_node_resources_node_idx").on(t.nodeId),
    index("roadmap_node_resources_item_idx").on(t.learningItemId),
  ],
);

export const roadmapNodeAssessments = sqliteTable(
  "roadmap_node_assessments",
  {
    nodeId: text("node_id")
      .notNull()
      .references(() => roadmapNodes.id, { onDelete: "cascade" }),
    assessmentId: text("assessment_id")
      .notNull()
      .references(() => assessments.id, { onDelete: "cascade" }),
    required: integer("required", { mode: "boolean" }).notNull().default(true),
    passScoreOverride: integer("pass_score_override"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [
    primaryKey({
      columns: [t.nodeId, t.assessmentId],
      name: "roadmap_node_assessments_pk",
    }),
    index("roadmap_node_assessments_node_idx").on(t.nodeId),
    index("roadmap_node_assessments_assessment_idx").on(t.assessmentId),
  ],
);

export const roadmapNodeRules = sqliteTable(
  "roadmap_node_rules",
  {
    id: text("id").primaryKey(),
    roadmapId: text("roadmap_id")
      .notNull()
      .references(() => roadmaps.id, { onDelete: "cascade" }),
    nodeId: text("node_id")
      .notNull()
      .references(() => roadmapNodes.id, { onDelete: "cascade" }),
    ruleType: text("rule_type").notNull().default("unlock"), // unlock|recommend|review
    ruleJson: text("rule_json", { mode: "json" }).notNull(),
    priority: integer("priority").notNull().default(0),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [
    index("roadmap_node_rules_roadmap_idx").on(t.roadmapId),
    index("roadmap_node_rules_node_idx").on(t.nodeId),
    index("roadmap_node_rules_type_idx").on(t.ruleType),
  ],
);

/**
 * Canonical user<->roadmap relation.
 * - many completed roadmaps per user (status='completed')
 * - exactly one selected roadmap per user (is_selected=true), enforced by partial unique index
 */
export const userRoadmapRecords = sqliteTable(
  "user_roadmap_records",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roadmapId: text("roadmap_id")
      .notNull()
      .references(() => roadmaps.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("active"), // active|completed|archived
    isSelected: integer("is_selected", { mode: "boolean" })
      .notNull()
      .default(false),
    selectedAt: integer("selected_at", { mode: "timestamp_ms" }),
    startedAt: integer("started_at", { mode: "timestamp_ms" }),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
    lastOpenedAt: integer("last_opened_at", { mode: "timestamp_ms" }),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [
    primaryKey({
      columns: [t.userId, t.roadmapId],
      name: "user_roadmap_records_pk",
    }),
    uniqueIndex("user_roadmap_one_selected_uq")
      .on(t.userId)
      .where(sql`${t.isSelected} = 1`),
    index("user_roadmap_records_user_status_idx").on(t.userId, t.status),
    index("user_roadmap_records_user_completed_idx").on(
      t.userId,
      t.completedAt,
    ),
    index("user_roadmap_records_user_selected_idx").on(t.userId, t.isSelected),
  ],
);

export const userRoadmapBranchChoices = sqliteTable(
  "user_roadmap_branch_choices",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roadmapId: text("roadmap_id")
      .notNull()
      .references(() => roadmaps.id, { onDelete: "cascade" }),
    choiceNodeId: text("choice_node_id")
      .notNull()
      .references(() => roadmapNodes.id, { onDelete: "cascade" }),
    choiceId: text("choice_id").notNull(),
    selectedAt: integer("selected_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [
    primaryKey({
      columns: [t.userId, t.roadmapId, t.choiceNodeId],
      name: "user_roadmap_branch_choices_pk",
    }),
    index("user_roadmap_branch_choices_user_roadmap_idx").on(
      t.userId,
      t.roadmapId,
    ),
  ],
);

export const userCompetencyMastery = sqliteTable(
  "user_competency_mastery",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    competencyId: text("competency_id")
      .notNull()
      .references(() => competencies.id, { onDelete: "cascade" }),
    state: text("state").notNull().default("not_started"), // not_started|learning|mastered|review_required
    score: real("score").notNull().default(0),
    confidence: real("confidence").notNull().default(0),
    evidenceCount: integer("evidence_count").notNull().default(0),
    lastEvidenceType: text("last_evidence_type"),
    lastEvidenceId: text("last_evidence_id"),
    lastEvidenceAt: integer("last_evidence_at", { mode: "timestamp_ms" }),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [
    primaryKey({
      columns: [t.userId, t.competencyId],
      name: "user_competency_mastery_pk",
    }),
    index("user_competency_mastery_user_idx").on(t.userId),
    index("user_competency_mastery_state_idx").on(t.state),
  ],
);

export const userAssessmentAttempts = sqliteTable(
  "user_assessment_attempts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    assessmentId: text("assessment_id")
      .notNull()
      .references(() => assessments.id, { onDelete: "cascade" }),
    roadmapId: text("roadmap_id").references(() => roadmaps.id, {
      onDelete: "set null",
    }),
    nodeId: text("node_id").references(() => roadmapNodes.id, {
      onDelete: "set null",
    }),
    score: integer("score"),
    maxScore: integer("max_score"),
    passed: integer("passed", { mode: "boolean" }),
    status: text("status").notNull().default("submitted"), // started|submitted|graded|invalid
    responseJson: text("response_json", { mode: "json" }),
    evaluationJson: text("evaluation_json", { mode: "json" }),
    idempotencyKey: text("idempotency_key"),
    startedAt: integer("started_at", { mode: "timestamp_ms" }),
    submittedAt: integer("submitted_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [
    unique("user_assessment_attempts_idempotency_uq").on(
      t.userId,
      t.assessmentId,
      t.idempotencyKey,
    ),
    index("user_assessment_attempts_user_idx").on(t.userId),
    index("user_assessment_attempts_assessment_idx").on(t.assessmentId),
    index("user_assessment_attempts_user_node_idx").on(t.userId, t.nodeId),
  ],
);

export const userLearningItemProgress = sqliteTable(
  "user_learning_item_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    learningItemId: text("learning_item_id")
      .notNull()
      .references(() => learningItems.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("not_started"), // not_started|in_progress|completed
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [
    primaryKey({
      columns: [t.userId, t.learningItemId],
      name: "user_learning_item_progress_pk",
    }),
    index("user_learning_item_progress_user_idx").on(t.userId),
  ],
);
