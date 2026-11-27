import { and, eq } from "drizzle-orm";
import { db } from "../index";
import {
  phonicsIncorrectAnswers,
  phonicsLessonProgress,
  phonicsSymbolProgress,
  userFavorites,
  userLessonCompletions,
  userPhonicsSettings,
  userProfiles,
  userProgress,
  userRoadmapBranchChoices,
  userRoadmapNodeProgress,
  userRoadmapRecords,
  userTaskCompletions,
} from "../schema";

export interface MadaraPersistedState {
  xp: number;
  wordsMastered: number;
  lessonsCompleted: number;
  streakDays: number;
  accuracy: number;
  favorites: string[];
  tasksDone: string[];
  claimedDailyReward: boolean;
  completedLessons: string[];
  themeMode: "light" | "dark" | "system";
  goal: "Travel" | "HSK" | "Conversation" | "Culture";
  level: "Beginner · HSK 1–2" | "Elementary · HSK 3" | "Intermediate";
  dailyGoal: 5 | 10 | 15;
  reminders: boolean;
  sound: boolean;
  language: "Indonesian / English" | "English / Indonesian";
  onboardingDone: boolean;
  intensiveEnrolled: boolean;
  sidebarCollapsed: boolean;
  moreMenuLayout: "grid-2" | "grid-3" | "grid-4" | "list";
  roadmapProgressById: Record<
    string,
    { completedNodeIds: string[]; inProgressNodeId: string | null }
  >;
  selectedPathRoadmapId: string | null;
  roadmapChoiceById: Record<string, Record<string, string>>;
}

export interface PhonicsPersistedState {
  displayMode: "pinyin" | "zhuyin" | "both";
  selectedAccent: "putonghua" | "guoyu";
  playbackRate: 0.75 | 1;
  lessonProgress: Record<
    string,
    {
      status: "not-started" | "in-progress" | "completed";
      bestScore: number;
      lastScore: number;
      accuracy: number;
      attempts: number;
      completedAt?: string;
      mastery: "new" | "learning" | "review" | "mastered";
      incorrectExerciseIds: string[];
    }
  >;
  symbolProgress: Record<
    string,
    {
      mastery: "new" | "learning" | "review" | "mastered";
      correct: number;
      incorrect: number;
      lastReviewedAt?: string;
    }
  >;
  incorrectAnswers: Array<{
    id: string;
    scope: "pinyin" | "zhuyin";
    lessonId: string;
    exerciseId: string;
    prompt: string;
    correctAnswer: string;
    userAnswer: string;
    createdAt: string;
    resolved: boolean;
  }>;
  totalXp: number;
}

export function ensureUserRows(userId: string) {
  const now = new Date();
  db.insert(userProfiles)
    .values({ userId, updatedAt: now })
    .onConflictDoNothing()
    .run();
  db.insert(userProgress)
    .values({ userId, updatedAt: now })
    .onConflictDoNothing()
    .run();
}

export function getMadaraPersistedState(
  userId: string,
): MadaraPersistedState | null {
  const profile = db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .get();
  const progress = db
    .select()
    .from(userProgress)
    .where(eq(userProgress.userId, userId))
    .get();

  if (!profile && !progress) return null;

  const favRows = db
    .select()
    .from(userFavorites)
    .where(eq(userFavorites.userId, userId))
    .all();
  const taskRows = db
    .select()
    .from(userTaskCompletions)
    .where(eq(userTaskCompletions.userId, userId))
    .all();
  const lessonRows = db
    .select()
    .from(userLessonCompletions)
    .where(eq(userLessonCompletions.userId, userId))
    .all();
  const roadmapRows = db
    .select()
    .from(userRoadmapNodeProgress)
    .where(eq(userRoadmapNodeProgress.userId, userId))
    .all();
  const choiceRows = db
    .select()
    .from(userRoadmapBranchChoices)
    .where(eq(userRoadmapBranchChoices.userId, userId))
    .all();

  const roadmapProgressById: MadaraPersistedState["roadmapProgressById"] = {};
  for (const r of roadmapRows) {
    const entry = roadmapProgressById[r.roadmapId] ?? {
      completedNodeIds: [],
      inProgressNodeId: null,
    };
    if (r.status === "completed") {
      if (!entry.completedNodeIds.includes(r.nodeId))
        entry.completedNodeIds.push(r.nodeId);
    } else if (r.status === "in-progress") {
      entry.inProgressNodeId = r.nodeId;
    }
    roadmapProgressById[r.roadmapId] = entry;
  }

  const roadmapChoiceById: MadaraPersistedState["roadmapChoiceById"] = {};
  for (const c of choiceRows) {
    const byRoadmap = roadmapChoiceById[c.roadmapId] ?? {};
    byRoadmap[c.choiceNodeId] = c.choiceId;
    roadmapChoiceById[c.roadmapId] = byRoadmap;
  }

  return {
    xp: progress?.xp ?? 0,
    wordsMastered: progress?.wordsMastered ?? 0,
    lessonsCompleted: progress?.lessonsCompleted ?? 0,
    streakDays: progress?.streakDays ?? 0,
    accuracy: progress?.accuracy ?? 0,
    favorites: favRows.map((r) => r.hanzi),
    tasksDone: taskRows.map((r) => r.taskId),
    claimedDailyReward: progress?.claimedDailyReward ?? false,
    completedLessons: lessonRows.map((r) => r.lessonKey),
    themeMode:
      (profile?.themeMode as MadaraPersistedState["themeMode"]) ?? "light",
    goal: (profile?.goal as MadaraPersistedState["goal"]) ?? "Conversation",
    level:
      (profile?.level as MadaraPersistedState["level"]) ?? "Beginner · HSK 1–2",
    dailyGoal:
      (profile?.dailyGoalMin as MadaraPersistedState["dailyGoal"]) ?? 10,
    reminders: profile?.reminders ?? true,
    sound: profile?.sound ?? true,
    language:
      (profile?.language as MadaraPersistedState["language"]) ??
      "Indonesian / English",
    onboardingDone: profile?.onboardingDone ?? false,
    intensiveEnrolled: profile?.intensiveEnrolled ?? false,
    sidebarCollapsed: profile?.sidebarCollapsed ?? false,
    moreMenuLayout:
      (profile?.moreMenuLayout as MadaraPersistedState["moreMenuLayout"]) ??
      "grid-2",
    roadmapProgressById,
    selectedPathRoadmapId: profile?.selectedPathRoadmapId ?? null,
    roadmapChoiceById,
  };
}

export function saveMadaraPersistedState(
  userId: string,
  state: MadaraPersistedState,
) {
  const now = new Date();

  db.transaction((tx) => {
    tx.insert(userProfiles)
      .values({
        userId: userId,
        displayName: null,
        goal: state.goal,
        level: state.level,
        dailyGoalMin: state.dailyGoal,
        language: state.language,
        themeMode: state.themeMode,
        reminders: state.reminders,
        sound: state.sound,
        onboardingDone: state.onboardingDone,
        intensiveEnrolled: state.intensiveEnrolled,
        sidebarCollapsed: state.sidebarCollapsed,
        moreMenuLayout: state.moreMenuLayout,
        selectedPathRoadmapId: state.selectedPathRoadmapId,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          goal: state.goal,
          level: state.level,
          dailyGoalMin: state.dailyGoal,
          language: state.language,
          themeMode: state.themeMode,
          reminders: state.reminders,
          sound: state.sound,
          onboardingDone: state.onboardingDone,
          intensiveEnrolled: state.intensiveEnrolled,
          sidebarCollapsed: state.sidebarCollapsed,
          moreMenuLayout: state.moreMenuLayout,
          selectedPathRoadmapId: state.selectedPathRoadmapId,
          updatedAt: now,
        },
      })
      .run();

    // Keep canonical single-selected roadmap record in sync.
    tx.update(userRoadmapRecords)
      .set({ isSelected: false, selectedAt: null, updatedAt: now })
      .where(eq(userRoadmapRecords.userId, userId))
      .run();
    if (state.selectedPathRoadmapId) {
      const existingSelected = tx
        .select()
        .from(userRoadmapRecords)
        .where(
          and(
            eq(userRoadmapRecords.userId, userId),
            eq(userRoadmapRecords.roadmapId, state.selectedPathRoadmapId),
          ),
        )
        .get();
      tx.insert(userRoadmapRecords)
        .values({
          userId,
          roadmapId: state.selectedPathRoadmapId,
          status:
            existingSelected?.status === "completed" ? "completed" : "active",
          isSelected: true,
          selectedAt: now,
          startedAt: existingSelected?.startedAt ?? now,
          completedAt: existingSelected?.completedAt ?? null,
          lastOpenedAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [userRoadmapRecords.userId, userRoadmapRecords.roadmapId],
          set: {
            isSelected: true,
            selectedAt: now,
            lastOpenedAt: now,
            updatedAt: now,
            status:
              existingSelected?.status === "completed" ? "completed" : "active",
          },
        })
        .run();
    }

    tx.insert(userProgress)
      .values({
        userId: userId,
        xp: state.xp,
        wordsMastered: state.wordsMastered,
        lessonsCompleted: state.lessonsCompleted,
        streakDays: state.streakDays,
        accuracy: state.accuracy,
        claimedDailyReward: state.claimedDailyReward,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: userProgress.userId,
        set: {
          xp: state.xp,
          wordsMastered: state.wordsMastered,
          lessonsCompleted: state.lessonsCompleted,
          streakDays: state.streakDays,
          accuracy: state.accuracy,
          claimedDailyReward: state.claimedDailyReward,
          updatedAt: now,
        },
      })
      .run();

    // Replace favorites
    tx.delete(userFavorites).where(eq(userFavorites.userId, userId)).run();
    for (const hanzi of state.favorites) {
      tx.insert(userFavorites)
        .values({ userId: userId, hanzi, vocabularyId: null, createdAt: now })
        .onConflictDoNothing()
        .run();
    }

    tx.delete(userTaskCompletions)
      .where(eq(userTaskCompletions.userId, userId))
      .run();
    for (const taskId of state.tasksDone) {
      tx.insert(userTaskCompletions)
        .values({ userId: userId, taskId, xpAwarded: 0, completedAt: now })
        .onConflictDoNothing()
        .run();
    }

    tx.delete(userLessonCompletions)
      .where(eq(userLessonCompletions.userId, userId))
      .run();
    for (const lessonKey of state.completedLessons) {
      tx.insert(userLessonCompletions)
        .values({ userId: userId, lessonKey, xpAwarded: 0, completedAt: now })
        .onConflictDoNothing()
        .run();
    }

    tx.delete(userRoadmapNodeProgress)
      .where(eq(userRoadmapNodeProgress.userId, userId))
      .run();
    for (const [roadmapId, rp] of Object.entries(state.roadmapProgressById)) {
      for (const nodeId of rp.completedNodeIds) {
        tx.insert(userRoadmapNodeProgress)
          .values({
            userId: userId,
            roadmapId,
            nodeId,
            status: "completed",
            updatedAt: now,
          })
          .onConflictDoNothing()
          .run();
      }
      if (rp.inProgressNodeId) {
        tx.insert(userRoadmapNodeProgress)
          .values({
            userId: userId,
            roadmapId,
            nodeId: rp.inProgressNodeId,
            status: "in-progress",
            updatedAt: now,
          })
          .onConflictDoNothing()
          .run();
      }
    }

    tx.delete(userRoadmapBranchChoices)
      .where(eq(userRoadmapBranchChoices.userId, userId))
      .run();
    for (const [roadmapId, choices] of Object.entries(
      state.roadmapChoiceById ?? {},
    )) {
      for (const [choiceNodeId, choiceId] of Object.entries(choices ?? {})) {
        if (!choiceNodeId || !choiceId) continue;
        tx.insert(userRoadmapBranchChoices)
          .values({
            userId,
            roadmapId,
            choiceNodeId,
            choiceId,
            selectedAt: now,
            updatedAt: now,
          })
          .onConflictDoNothing()
          .run();
      }
    }
  });
}

export function getPhonicsPersistedState(
  userId: string,
): PhonicsPersistedState | null {
  const settings = db
    .select()
    .from(userPhonicsSettings)
    .where(eq(userPhonicsSettings.userId, userId))
    .get();
  const lessonRows = db
    .select()
    .from(phonicsLessonProgress)
    .where(eq(phonicsLessonProgress.userId, userId))
    .all();
  const symbolRows = db
    .select()
    .from(phonicsSymbolProgress)
    .where(eq(phonicsSymbolProgress.userId, userId))
    .all();
  const incorrectRows = db
    .select()
    .from(phonicsIncorrectAnswers)
    .where(eq(phonicsIncorrectAnswers.userId, userId))
    .all();

  if (
    !settings &&
    lessonRows.length === 0 &&
    symbolRows.length === 0 &&
    incorrectRows.length === 0
  ) {
    return null;
  }

  const lessonProgress: PhonicsPersistedState["lessonProgress"] = {};
  for (const r of lessonRows) {
    lessonProgress[r.lessonId] = {
      status:
        r.status as PhonicsPersistedState["lessonProgress"][string]["status"],
      bestScore: r.bestScore,
      lastScore: r.lastScore,
      accuracy: r.accuracy,
      attempts: r.attempts,
      completedAt: r.completedAt ?? undefined,
      mastery:
        r.mastery as PhonicsPersistedState["lessonProgress"][string]["mastery"],
      incorrectExerciseIds: (r.incorrectExerciseIds as string[]) ?? [],
    };
  }

  const symbolProgress: PhonicsPersistedState["symbolProgress"] = {};
  for (const r of symbolRows) {
    symbolProgress[r.symbolId] = {
      mastery:
        r.mastery as PhonicsPersistedState["symbolProgress"][string]["mastery"],
      correct: r.correct,
      incorrect: r.incorrect,
      lastReviewedAt: r.lastReviewedAt ?? undefined,
    };
  }

  return {
    displayMode:
      (settings?.displayMode as PhonicsPersistedState["displayMode"]) ?? "both",
    selectedAccent:
      (settings?.selectedAccent as PhonicsPersistedState["selectedAccent"]) ??
      "putonghua",
    playbackRate:
      (settings?.playbackRate as PhonicsPersistedState["playbackRate"]) ?? 1,
    lessonProgress,
    symbolProgress,
    incorrectAnswers: incorrectRows.map((r) => ({
      id: r.id,
      scope: r.scope as "pinyin" | "zhuyin",
      lessonId: r.lessonId,
      exerciseId: r.exerciseId,
      prompt: r.prompt,
      correctAnswer: r.correctAnswer,
      userAnswer: r.userAnswer,
      createdAt: r.createdAt,
      resolved: r.resolved,
    })),
    totalXp: settings?.totalXp ?? 0,
  };
}

export function savePhonicsPersistedState(
  userId: string,
  state: PhonicsPersistedState,
) {
  const now = new Date();

  db.transaction((tx) => {
    tx.insert(userPhonicsSettings)
      .values({
        userId: userId,
        displayMode: state.displayMode,
        selectedAccent: state.selectedAccent,
        playbackRate: state.playbackRate,
        totalXp: state.totalXp,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: userPhonicsSettings.userId,
        set: {
          displayMode: state.displayMode,
          selectedAccent: state.selectedAccent,
          playbackRate: state.playbackRate,
          totalXp: state.totalXp,
          updatedAt: now,
        },
      })
      .run();

    tx.delete(phonicsLessonProgress)
      .where(eq(phonicsLessonProgress.userId, userId))
      .run();
    for (const [lessonId, p] of Object.entries(state.lessonProgress)) {
      tx.insert(phonicsLessonProgress)
        .values({
          userId: userId,
          lessonId,
          status: p.status,
          bestScore: p.bestScore,
          lastScore: p.lastScore,
          accuracy: p.accuracy,
          attempts: p.attempts,
          completedAt: p.completedAt ?? null,
          mastery: p.mastery,
          incorrectExerciseIds: p.incorrectExerciseIds,
          updatedAt: now,
        })
        .onConflictDoNothing()
        .run();
    }

    tx.delete(phonicsSymbolProgress)
      .where(eq(phonicsSymbolProgress.userId, userId))
      .run();
    for (const [symbolId, p] of Object.entries(state.symbolProgress)) {
      tx.insert(phonicsSymbolProgress)
        .values({
          userId: userId,
          symbolId,
          mastery: p.mastery,
          correct: p.correct,
          incorrect: p.incorrect,
          lastReviewedAt: p.lastReviewedAt ?? null,
          updatedAt: now,
        })
        .onConflictDoNothing()
        .run();
    }

    tx.delete(phonicsIncorrectAnswers)
      .where(eq(phonicsIncorrectAnswers.userId, userId))
      .run();
    for (const a of state.incorrectAnswers.slice(0, 200)) {
      tx.insert(phonicsIncorrectAnswers)
        .values({
          id: a.id,
          userId: userId,
          scope: a.scope,
          lessonId: a.lessonId,
          exerciseId: a.exerciseId,
          prompt: a.prompt,
          correctAnswer: a.correctAnswer,
          userAnswer: a.userAnswer,
          createdAt: a.createdAt,
          resolved: a.resolved,
        })
        .onConflictDoNothing()
        .run();
    }
  });
}

export function hasAnyUserState(userId: string): boolean {
  const profile = db
    .select({ userId: userProfiles.userId })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .get();
  const progress = db
    .select({ userId: userProgress.userId })
    .from(userProgress)
    .where(eq(userProgress.userId, userId))
    .get();
  return Boolean(profile || progress);
}
