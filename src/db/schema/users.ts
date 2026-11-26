import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { vocabularyWords, roadmaps, roadmapNodes } from "./content";
import { phonicsLessons, phonicsSymbols } from "./phonics";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull().default(""),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  phoneNumber: text("phone_number").unique(),
  phoneNumberVerified: integer("phone_number_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => [index("sessions_user_id_idx").on(t.userId)],
);

export const accounts = sqliteTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [index("accounts_user_id_idx").on(t.userId)],
);

export const verifications = sqliteTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [index("verifications_identifier_idx").on(t.identifier)],
);

export const userProfiles = sqliteTable("user_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  displayName: text("display_name"),
  goal: text("goal").notNull().default("Conversation"),
  level: text("level").notNull().default("Beginner · HSK 1–2"),
  dailyGoalMin: integer("daily_goal_min").notNull().default(10),
  language: text("language").notNull().default("Indonesian / English"),
  themeMode: text("theme_mode").notNull().default("light"),
  reminders: integer("reminders", { mode: "boolean" }).notNull().default(true),
  sound: integer("sound", { mode: "boolean" }).notNull().default(true),
  onboardingDone: integer("onboarding_done", { mode: "boolean" })
    .notNull()
    .default(false),
  intensiveEnrolled: integer("intensive_enrolled", { mode: "boolean" })
    .notNull()
    .default(false),
  sidebarCollapsed: integer("sidebar_collapsed", { mode: "boolean" })
    .notNull()
    .default(false),
  moreMenuLayout: text("more_menu_layout").notNull().default("grid-2"),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const userProgress = sqliteTable("user_progress", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  xp: integer("xp").notNull().default(0),
  wordsMastered: integer("words_mastered").notNull().default(0),
  lessonsCompleted: integer("lessons_completed").notNull().default(0),
  streakDays: integer("streak_days").notNull().default(0),
  accuracy: integer("accuracy").notNull().default(0),
  claimedDailyReward: integer("claimed_daily_reward", { mode: "boolean" })
    .notNull()
    .default(false),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const userFavorites = sqliteTable(
  "user_favorites",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    hanzi: text("hanzi").notNull(),
    vocabularyId: text("vocabulary_id").references(() => vocabularyWords.id, {
      onDelete: "set null",
    }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.hanzi], name: "user_favorites_pk" }),
    index("user_favorites_user_idx").on(t.userId),
  ],
);

export const userTaskCompletions = sqliteTable(
  "user_task_completions",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    taskId: text("task_id").notNull(),
    xpAwarded: integer("xp_awarded").notNull().default(0),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [
    primaryKey({
      columns: [t.userId, t.taskId],
      name: "user_task_completions_pk",
    }),
    index("user_task_completions_user_idx").on(t.userId),
  ],
);

export const userLessonCompletions = sqliteTable(
  "user_lesson_completions",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonKey: text("lesson_key").notNull(),
    xpAwarded: integer("xp_awarded").notNull().default(0),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [
    primaryKey({
      columns: [t.userId, t.lessonKey],
      name: "user_lesson_completions_pk",
    }),
    index("user_lesson_completions_user_idx").on(t.userId),
  ],
);

export const userRoadmapNodeProgress = sqliteTable(
  "user_roadmap_node_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roadmapId: text("roadmap_id")
      .notNull()
      .references(() => roadmaps.id, { onDelete: "cascade" }),
    nodeId: text("node_id")
      .notNull()
      .references(() => roadmapNodes.id, { onDelete: "cascade" }),
    status: text("status").notNull(), // "completed" | "in-progress"
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [
    primaryKey({
      columns: [t.userId, t.roadmapId, t.nodeId],
      name: "user_roadmap_node_progress_pk",
    }),
    index("user_roadmap_node_progress_user_roadmap_idx").on(
      t.userId,
      t.roadmapId,
    ),
  ],
);

export const userPhonicsSettings = sqliteTable("user_phonics_settings", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  displayMode: text("display_mode").notNull().default("both"),
  selectedAccent: text("selected_accent").notNull().default("putonghua"),
  playbackRate: integer("playback_rate").notNull().default(1),
  totalXp: integer("total_xp").notNull().default(0),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const phonicsLessonProgress = sqliteTable(
  "phonics_lesson_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => phonicsLessons.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("not-started"),
    bestScore: integer("best_score").notNull().default(0),
    lastScore: integer("last_score").notNull().default(0),
    accuracy: integer("accuracy").notNull().default(0),
    attempts: integer("attempts").notNull().default(0),
    completedAt: text("completed_at"),
    mastery: text("mastery").notNull().default("new"),
    incorrectExerciseIds: text("incorrect_exercise_ids", { mode: "json" })
      .notNull()
      .default([]),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [
    primaryKey({
      columns: [t.userId, t.lessonId],
      name: "phonics_lesson_progress_pk",
    }),
    index("phonics_lesson_progress_user_idx").on(t.userId),
  ],
);

export const phonicsSymbolProgress = sqliteTable(
  "phonics_symbol_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    symbolId: text("symbol_id")
      .notNull()
      .references(() => phonicsSymbols.id, { onDelete: "cascade" }),
    mastery: text("mastery").notNull().default("new"),
    correct: integer("correct").notNull().default(0),
    incorrect: integer("incorrect").notNull().default(0),
    lastReviewedAt: text("last_reviewed_at"),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [
    primaryKey({
      columns: [t.userId, t.symbolId],
      name: "phonics_symbol_progress_pk",
    }),
    index("phonics_symbol_progress_user_idx").on(t.userId),
  ],
);

export const phonicsIncorrectAnswers = sqliteTable(
  "phonics_incorrect_answers",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    scope: text("scope").notNull(),
    lessonId: text("lesson_id").notNull(),
    exerciseId: text("exercise_id").notNull(),
    prompt: text("prompt").notNull(),
    correctAnswer: text("correct_answer").notNull(),
    userAnswer: text("user_answer").notNull(),
    createdAt: text("created_at").notNull(),
    resolved: integer("resolved", { mode: "boolean" }).notNull().default(false),
  },
  (t) => [index("phonics_incorrect_answers_user_idx").on(t.userId)],
);
