import {
  index,
  integer,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";

export const phonicsSymbols = sqliteTable(
  "phonics_symbols",
  {
    id: text("id").primaryKey(),
    scope: text("scope").notNull(),
    kind: text("kind").notNull(),
    label: text("label").notNull(),
    zhuyin: text("zhuyin"),
    pinyin: text("pinyin"),
    groupName: text("group_name").notNull(),
    description: text("description").notNull(),
    descriptionId: text("description_id").notNull(),
    audio: text("audio", { mode: "json" }),
    examples: text("examples", { mode: "json" }).notNull(),
    notes: text("notes", { mode: "json" }),
    commonMistakes: text("common_mistakes", { mode: "json" }),
  },
  (t) => [index("phonics_symbols_scope_idx").on(t.scope)],
);

export const phonicsRules = sqliteTable(
  "phonics_rules",
  {
    id: text("id").primaryKey(),
    scope: text("scope").notNull(),
    title: text("title").notNull(),
    titleId: text("title_id").notNull(),
    explanation: text("explanation").notNull(),
    explanationId: text("explanation_id").notNull(),
    examples: text("examples", { mode: "json" }).notNull(),
  },
  (t) => [index("phonics_rules_scope_idx").on(t.scope)],
);

export const phonicsLessons = sqliteTable(
  "phonics_lessons",
  {
    id: text("id").primaryKey(),
    scope: text("scope").notNull(),
    slug: text("slug").notNull(),
    order: integer("order").notNull(),
    title: text("title").notNull(),
    titleId: text("title_id").notNull(),
    summary: text("summary").notNull(),
    summaryId: text("summary_id").notNull(),
    objectives: text("objectives", { mode: "json" }).notNull(),
    estimatedMin: integer("estimated_min").notNull(),
    xpReward: integer("xp_reward").notNull(),
    symbolIds: text("symbol_ids", { mode: "json" }).notNull(),
    ruleIds: text("rule_ids", { mode: "json" }).notNull(),
    exerciseIds: text("exercise_ids", { mode: "json" }).notNull(),
    quizExerciseIds: text("quiz_exercise_ids", { mode: "json" }).notNull(),
  },
  (t) => [
    unique("phonics_lessons_scope_slug_uq").on(t.scope, t.slug),
    index("phonics_lessons_scope_order_idx").on(t.scope, t.order),
  ],
);

export const phonicsExercises = sqliteTable(
  "phonics_exercises",
  {
    id: text("id").primaryKey(),
    scope: text("scope").notNull(),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => phonicsLessons.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    prompt: text("prompt").notNull(),
    promptId: text("prompt_id").notNull(),
    promptAudioText: text("prompt_audio_text"),
    promptAudio: text("prompt_audio", { mode: "json" }),
    choices: text("choices", { mode: "json" }),
    choiceLabels: text("choice_labels", { mode: "json" }),
    correctChoice: text("correct_choice"),
    pairs: text("pairs", { mode: "json" }),
    build: text("build", { mode: "json" }),
    compare: text("compare", { mode: "json" }),
    explanation: text("explanation").notNull(),
    explanationId: text("explanation_id").notNull(),
  },
  (t) => [
    index("phonics_exercises_scope_idx").on(t.scope),
    index("phonics_exercises_lesson_idx").on(t.lessonId),
  ],
);
