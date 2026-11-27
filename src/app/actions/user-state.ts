"use server";

import { headers } from "next/headers";
import { z } from "zod";
import {
  ensureUserRows,
  getMadaraPersistedState,
  getPhonicsPersistedState,
  hasAnyUserState,
  type MadaraPersistedState,
  type PhonicsPersistedState,
  saveMadaraPersistedState,
  savePhonicsPersistedState,
} from "@/db/repositories/user-state.repo";
import { auth } from "@/lib/auth";

const roadmapProgressSchema = z.object({
  completedNodeIds: z.array(z.string()),
  inProgressNodeId: z.string().nullable(),
});

const madaraStateSchema = z.object({
  xp: z.number().int().nonnegative(),
  wordsMastered: z.number().int().nonnegative(),
  lessonsCompleted: z.number().int().nonnegative(),
  streakDays: z.number().int().nonnegative(),
  accuracy: z.number().int().min(0).max(100),
  favorites: z.array(z.string()),
  tasksDone: z.array(z.string()),
  claimedDailyReward: z.boolean(),
  completedLessons: z.array(z.string()),
  themeMode: z.enum(["light", "dark", "system"]),
  goal: z.enum(["Travel", "HSK", "Conversation", "Culture"]),
  level: z.enum(["Beginner · HSK 1–2", "Elementary · HSK 3", "Intermediate"]),
  dailyGoal: z.union([z.literal(5), z.literal(10), z.literal(15)]),
  reminders: z.boolean(),
  sound: z.boolean(),
  language: z.enum(["Indonesian / English", "English / Indonesian"]),
  onboardingDone: z.boolean(),
  intensiveEnrolled: z.boolean(),
  sidebarCollapsed: z.boolean(),
  moreMenuLayout: z.enum(["grid-2", "grid-3", "grid-4", "list"]),
  roadmapProgressById: z.record(z.string(), roadmapProgressSchema),
  selectedPathRoadmapId: z.string().nullable(),
  roadmapChoiceById: z
    .record(z.string(), z.record(z.string(), z.string()))
    .default({}),
});

const phonicsLessonProgressSchema = z.object({
  status: z.enum(["not-started", "in-progress", "completed"]),
  bestScore: z.number(),
  lastScore: z.number(),
  accuracy: z.number(),
  attempts: z.number(),
  completedAt: z.string().optional(),
  mastery: z.enum(["new", "learning", "review", "mastered"]),
  incorrectExerciseIds: z.array(z.string()),
});

const phonicsSymbolProgressSchema = z.object({
  mastery: z.enum(["new", "learning", "review", "mastered"]),
  correct: z.number(),
  incorrect: z.number(),
  lastReviewedAt: z.string().optional(),
});

const phonicsStateSchema = z.object({
  displayMode: z.enum(["pinyin", "zhuyin", "both"]),
  selectedAccent: z.enum(["putonghua", "guoyu"]),
  playbackRate: z.union([z.literal(0.75), z.literal(1)]),
  lessonProgress: z.record(z.string(), phonicsLessonProgressSchema),
  symbolProgress: z.record(z.string(), phonicsSymbolProgressSchema),
  incorrectAnswers: z.array(
    z.object({
      id: z.string(),
      scope: z.enum(["pinyin", "zhuyin"]),
      lessonId: z.string(),
      exerciseId: z.string(),
      prompt: z.string(),
      correctAnswer: z.string(),
      userAnswer: z.string(),
      createdAt: z.string(),
      resolved: z.boolean(),
    }),
  ),
  totalXp: z.number(),
});

async function requireUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }
  return session.user.id;
}

export async function loadUserStateAction() {
  const userId = await requireUserId();
  ensureUserRows(userId);
  const [madara, phonics, hasState] = [
    getMadaraPersistedState(userId),
    getPhonicsPersistedState(userId),
    hasAnyUserState(userId),
  ];
  return { madara, phonics, hasState };
}

export async function saveMadaraStateAction(state: MadaraPersistedState) {
  const userId = await requireUserId();
  const parsed = madaraStateSchema.parse(state);
  saveMadaraPersistedState(userId, parsed);
  return { ok: true as const };
}

export async function savePhonicsStateAction(state: PhonicsPersistedState) {
  const userId = await requireUserId();
  const parsed = phonicsStateSchema.parse(state);
  savePhonicsPersistedState(userId, parsed);
  return { ok: true as const };
}

export async function migrateLocalStorageStateAction(input: {
  madara?: MadaraPersistedState | null;
  phonics?: PhonicsPersistedState | null;
}) {
  const userId = await requireUserId();
  if (hasAnyUserState(userId)) {
    return { migrated: false as const, reason: "db-has-state" as const };
  }

  if (input.madara) {
    const parsed = madaraStateSchema.parse(input.madara);
    saveMadaraPersistedState(userId, parsed);
  }
  if (input.phonics) {
    const parsed = phonicsStateSchema.parse(input.phonics);
    savePhonicsPersistedState(userId, parsed);
  }

  return { migrated: true as const };
}
