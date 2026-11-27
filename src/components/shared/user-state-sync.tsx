"use client";

import { useEffect, useRef } from "react";
import {
  loadUserStateAction,
  migrateLocalStorageStateAction,
  saveMadaraStateAction,
  savePhonicsStateAction,
} from "@/app/actions/user-state";
import type {
  MadaraPersistedState,
  PhonicsPersistedState,
} from "@/db/repositories/user-state.repo";
import { usePhonicsStore } from "@/modules/practice-pinyin-zhuyin/store";
import { useMadaraStore } from "@/store/madara-store";

function getMadaraSnapshot(): MadaraPersistedState {
  const s = useMadaraStore.getState();
  return {
    xp: s.xp,
    wordsMastered: s.wordsMastered,
    lessonsCompleted: s.lessonsCompleted,
    streakDays: s.streakDays,
    accuracy: s.accuracy,
    favorites: s.favorites,
    tasksDone: s.tasksDone,
    claimedDailyReward: s.claimedDailyReward,
    completedLessons: s.completedLessons,
    themeMode: s.themeMode,
    goal: s.goal,
    level: s.level,
    dailyGoal: s.dailyGoal,
    reminders: s.reminders,
    sound: s.sound,
    language: s.language,
    onboardingDone: s.onboardingDone,
    intensiveEnrolled: s.intensiveEnrolled,
    sidebarCollapsed: s.sidebarCollapsed,
    moreMenuLayout: s.moreMenuLayout,
    roadmapProgressById: s.roadmapProgressById,
    selectedPathRoadmapId: s.selectedPathRoadmapId,
    roadmapChoiceById: s.roadmapChoiceById,
  };
}

function getPhonicsSnapshot(): PhonicsPersistedState {
  const s = usePhonicsStore.getState();
  return {
    displayMode: s.displayMode,
    selectedAccent: s.selectedAccent,
    playbackRate: s.playbackRate,
    lessonProgress: s.lessonProgress,
    symbolProgress: s.symbolProgress,
    incorrectAnswers: s.incorrectAnswers,
    totalXp: s.totalXp,
  };
}

function readLocalMadara(): MadaraPersistedState | null {
  try {
    const raw = localStorage.getItem("madara-modular-v1");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const state = parsed?.state ?? parsed;
    if (!state || typeof state !== "object") return null;
    return {
      xp: state.xp ?? 0,
      wordsMastered: state.wordsMastered ?? 0,
      lessonsCompleted: state.lessonsCompleted ?? 0,
      streakDays: state.streakDays ?? 0,
      accuracy: state.accuracy ?? 0,
      favorites: Array.isArray(state.favorites) ? state.favorites : [],
      tasksDone: Array.isArray(state.tasksDone) ? state.tasksDone : [],
      claimedDailyReward: Boolean(state.claimedDailyReward),
      completedLessons: Array.isArray(state.completedLessons)
        ? state.completedLessons
        : [],
      themeMode: state.themeMode ?? "light",
      goal: state.goal ?? "Conversation",
      level: state.level ?? "Beginner · HSK 1–2",
      dailyGoal: state.dailyGoal ?? 10,
      reminders: state.reminders ?? true,
      sound: state.sound ?? true,
      language: state.language ?? "Indonesian / English",
      onboardingDone: Boolean(state.onboardingDone),
      intensiveEnrolled: Boolean(state.intensiveEnrolled),
      sidebarCollapsed: Boolean(state.sidebarCollapsed),
      moreMenuLayout: state.moreMenuLayout ?? "grid-2",
      roadmapProgressById:
        state.roadmapProgressById &&
        typeof state.roadmapProgressById === "object"
          ? state.roadmapProgressById
          : {},
      selectedPathRoadmapId:
        typeof state.selectedPathRoadmapId === "string"
          ? state.selectedPathRoadmapId
          : null,
      roadmapChoiceById:
        state.roadmapChoiceById && typeof state.roadmapChoiceById === "object"
          ? state.roadmapChoiceById
          : {},
    };
  } catch {
    return null;
  }
}

function readLocalPhonics(): PhonicsPersistedState | null {
  try {
    const raw = localStorage.getItem("mandaozi-phonics-v1");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const state = parsed?.state ?? parsed;
    if (!state || typeof state !== "object") return null;
    return {
      displayMode: state.displayMode ?? "both",
      selectedAccent: state.selectedAccent ?? "putonghua",
      playbackRate: state.playbackRate ?? 1,
      lessonProgress:
        state.lessonProgress && typeof state.lessonProgress === "object"
          ? state.lessonProgress
          : {},
      symbolProgress:
        state.symbolProgress && typeof state.symbolProgress === "object"
          ? state.symbolProgress
          : {},
      incorrectAnswers: Array.isArray(state.incorrectAnswers)
        ? state.incorrectAnswers
        : [],
      totalXp: state.totalXp ?? 0,
    };
  } catch {
    return null;
  }
}

export function UserStateSync() {
  const hydratingRef = useRef(true);
  const madaraTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phonicsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (!useMadaraStore.persist.hasHydrated()) {
          await new Promise<void>((resolve) => {
            const unsub = useMadaraStore.persist.onFinishHydration(() => {
              unsub();
              resolve();
            });
          });
        }
        if (cancelled) return;

        const loaded = await loadUserStateAction();
        if (cancelled) return;

        if (!loaded.hasState) {
          const localMadara = readLocalMadara();
          const localPhonics = readLocalPhonics();
          if (localMadara || localPhonics) {
            await migrateLocalStorageStateAction({
              madara: localMadara,
              phonics: localPhonics,
            });
            if (cancelled) return;
            // After migration, keep current local store values (already loaded from localStorage)
            hydratingRef.current = false;
            return;
          }
          // No DB state, no local state: persist current defaults to DB
          await saveMadaraStateAction(getMadaraSnapshot());
          await savePhonicsStateAction(getPhonicsSnapshot());
          if (cancelled) return;
          hydratingRef.current = false;
          return;
        }

        // Hydrate from DB (DB is canonical)
        if (loaded.madara) {
          const local = useMadaraStore.getState();
          const mergedMadara = {
            ...loaded.madara,
            // Preserve monotonic onboarding completion if it happened during hydration.
            onboardingDone:
              loaded.madara.onboardingDone || local.onboardingDone,
          };
          useMadaraStore.setState(mergedMadara);
          if (mergedMadara.onboardingDone && !loaded.madara.onboardingDone) {
            void saveMadaraStateAction(getMadaraSnapshot()).catch((err) =>
              console.error("Failed to persist onboarding completion", err),
            );
          }
        } else {
          await saveMadaraStateAction(getMadaraSnapshot());
        }
        if (loaded.phonics) {
          usePhonicsStore.setState(loaded.phonics);
        } else {
          await savePhonicsStateAction(getPhonicsSnapshot());
        }
      } catch (err) {
        console.error("UserStateSync hydration failed", err);
      } finally {
        if (!cancelled) hydratingRef.current = false;
      }
    })();

    const unsubMadara = useMadaraStore.subscribe(() => {
      if (hydratingRef.current) return;
      if (madaraTimer.current) clearTimeout(madaraTimer.current);
      madaraTimer.current = setTimeout(() => {
        void saveMadaraStateAction(getMadaraSnapshot()).catch((err) =>
          console.error("Failed to save madara state", err),
        );
      }, 500);
    });

    const unsubPhonics = usePhonicsStore.subscribe(() => {
      if (hydratingRef.current) return;
      if (phonicsTimer.current) clearTimeout(phonicsTimer.current);
      phonicsTimer.current = setTimeout(() => {
        void savePhonicsStateAction(getPhonicsSnapshot()).catch((err) =>
          console.error("Failed to save phonics state", err),
        );
      }, 500);
    });

    return () => {
      cancelled = true;
      unsubMadara();
      unsubPhonics();
      if (madaraTimer.current) clearTimeout(madaraTimer.current);
      if (phonicsTimer.current) clearTimeout(phonicsTimer.current);
    };
  }, []);

  return null;
}
