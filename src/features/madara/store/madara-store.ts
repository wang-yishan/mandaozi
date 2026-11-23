"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { FeatureId, PageId, PracticeTab } from "../types";

export type SaveStatus = "idle" | "saving" | "saved" | "error";
export type ThemeMode = "light" | "dark" | "system";
export type Goal = "Travel" | "HSK" | "Conversation" | "Culture";
export type Level =
  | "Beginner · HSK 1–2"
  | "Elementary · HSK 3"
  | "Intermediate";

export interface MadaraProgress {
  xp: number;
  wordsMastered: number;
  lessonsCompleted: number;
  streakDays: number;
  accuracy: number;
  favorites: string[];
  tasksDone: string[];
  claimedDailyReward: boolean;
  completedLessons: string[];
}

export interface MadaraSettings {
  themeMode: ThemeMode;
  goal: Goal;
  level: Level;
  dailyGoal: 5 | 10 | 15;
  reminders: boolean;
  sound: boolean;
  language: "Indonesian / English" | "English / Indonesian";
}

export type LessonResult = "correct" | "wrong" | null;

export interface MadaraUIState {
  page: PageId;
  previousPage: PageId;
  onboardingDone: boolean;
  onboardingStep: number;
  selectedFeatureId: FeatureId | null;
  selectedP3Id:
    | "p3-home-insights"
    | "p3-notification-center"
    | "p3-world-journey"
    | null;
  allFeaturesOpen: boolean;
  allFeaturesQuery: string;
  practiceTab: PracticeTab;
  dictionaryQuery: string;
  dictionaryFilter: "All" | "HSK1" | "HSK2" | "Favorites";
  enrollmentModalOpen: boolean;
  enrollmentDetailOpen: boolean;
  intensiveEnrolled: boolean;
  sidebarCollapsed: boolean;
  sidebarExpanded: Record<string, boolean>;
  toast: string | null;
  saveStatus: SaveStatus;
  selectedWorldCategoryId: string;
  lessonStep: number;
  lessonPick: string | null;
  lessonResult: LessonResult;
  lessonXp: number;
  lessonCorrect: number;
  lessonMatched: string[];
  lessonMatchPick: string | null;
}

export interface MadaraState
  extends MadaraProgress,
    MadaraSettings,
    MadaraUIState {
  setPage: (page: PageId) => void;
  openFeature: (id: FeatureId) => void;
  openP3Placeholder: (
    id: "p3-home-insights" | "p3-notification-center" | "p3-world-journey",
  ) => void;
  closeFeature: () => void;
  setAllFeaturesOpen: (open: boolean) => void;
  setAllFeaturesQuery: (q: string) => void;
  setOnboardingStep: (step: number) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setGoal: (goal: Goal) => void;
  setLevel: (level: Level) => void;
  setDailyGoal: (minutes: 5 | 10 | 15) => void;
  setReminders: (v: boolean) => void;
  setSound: (v: boolean) => void;
  toggleLanguage: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  toggleFavorite: (hanzi: string) => void;
  toggleTask: (taskId: string, xp: number) => void;
  claimDailyReward: () => void;
  addXp: (amount: number, reason?: string) => void;
  setPracticeTab: (tab: PracticeTab) => void;
  setDictionaryQuery: (q: string) => void;
  setDictionaryFilter: (f: "All" | "HSK1" | "HSK2" | "Favorites") => void;
  setEnrollmentModalOpen: (open: boolean) => void;
  setEnrollmentDetailOpen: (open: boolean) => void;
  setIntensiveEnrolled: (v: boolean) => void;
  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;
  toggleSidebarGroup: (id: string) => void;
  setSidebarGroupExpanded: (id: string, expanded: boolean) => void;
  showToast: (msg: string) => void;
  clearToast: () => void;
  markSaving: () => void;
  markSaved: () => void;
  markSaveError: () => void;
  selectWorldCategory: (id: string) => void;
  startWorldLesson: () => void;
  answerWorldLesson: (pick: string, correct: string) => void;
  pickWorldMatch: (item: string) => void;
  nextWorldLessonStep: () => void;
}

const initialProgress: MadaraProgress = {
  xp: 1240,
  wordsMastered: 128,
  lessonsCompleted: 24,
  streakDays: 12,
  accuracy: 86,
  favorites: ["你好", "谢谢"],
  tasksDone: [],
  claimedDailyReward: false,
  completedLessons: ["Nǐ hǎo", "Zàijiàn"],
};

const initialSettings: MadaraSettings = {
  themeMode: "light",
  goal: "Conversation",
  level: "Beginner · HSK 1–2",
  dailyGoal: 10,
  reminders: true,
  sound: true,
  language: "Indonesian / English",
};

const initialUI: MadaraUIState = {
  page: "home",
  previousPage: "home",
  onboardingDone: false,
  onboardingStep: 0,
  selectedFeatureId: null,
  selectedP3Id: null,
  allFeaturesOpen: false,
  allFeaturesQuery: "",
  practiceTab: "Flashcards",
  dictionaryQuery: "",
  dictionaryFilter: "All",
  enrollmentModalOpen: false,
  enrollmentDetailOpen: false,
  intensiveEnrolled: false,
  sidebarCollapsed: false,
  sidebarExpanded: {
    home: true,
    world: true,
    practice: true,
    dictionary: true,
    profile: true,
  },
  toast: null,
  saveStatus: "idle",
  selectedWorldCategoryId: "greetings",
  lessonStep: 0,
  lessonPick: null,
  lessonResult: null,
  lessonXp: 0,
  lessonCorrect: 0,
  lessonMatched: [],
  lessonMatchPick: null,
};

let toastTimer: ReturnType<typeof setTimeout> | undefined;
let saveTimer: ReturnType<typeof setTimeout> | undefined;

export const useMadaraStore = create<MadaraState>()(
  persist(
    (set, get) => ({
      ...initialProgress,
      ...initialSettings,
      ...initialUI,

      setPage: (page) =>
        set((s) => ({
          previousPage: s.page,
          page,
          allFeaturesOpen: false,
          selectedFeatureId: null,
          selectedP3Id: null,
        })),

      openFeature: (id) =>
        set((s) => ({
          previousPage: s.page,
          selectedFeatureId: id,
          selectedP3Id: null,
          page: "feature-detail" as PageId,
          allFeaturesOpen: false,
        })),

      openP3Placeholder: (id) =>
        set((s) => ({
          previousPage: s.page,
          selectedFeatureId: null,
          selectedP3Id: id,
          page: "feature-detail" as PageId,
          allFeaturesOpen: false,
        })),

      closeFeature: () =>
        set((s) => ({
          selectedFeatureId: null,
          selectedP3Id: null,
          page: s.previousPage === "feature-detail" ? "home" : s.previousPage,
        })),

      setAllFeaturesOpen: (open) =>
        set({
          allFeaturesOpen: open,
          allFeaturesQuery: open ? get().allFeaturesQuery : "",
        }),
      setAllFeaturesQuery: (q) => set({ allFeaturesQuery: q }),

      setOnboardingStep: (step) => set({ onboardingStep: step }),
      completeOnboarding: () =>
        set({ onboardingDone: true, page: "home", onboardingStep: 0 }),
      resetOnboarding: () =>
        set({ onboardingDone: false, onboardingStep: 0, page: "onboarding" }),

      setGoal: (goal) => set({ goal }),
      setLevel: (level) => set({ level }),
      setDailyGoal: (dailyGoal) => set({ dailyGoal }),
      setReminders: (reminders) => set({ reminders }),
      setSound: (sound) => set({ sound }),
      toggleLanguage: () =>
        set((s) => ({
          language:
            s.language === "Indonesian / English"
              ? "English / Indonesian"
              : "Indonesian / English",
        })),
      setThemeMode: (themeMode) => set({ themeMode }),

      toggleFavorite: (hanzi) =>
        set((s) => {
          const exists = s.favorites.includes(hanzi);
          const favorites = exists
            ? s.favorites.filter((h) => h !== hanzi)
            : [...s.favorites, hanzi];
          return { favorites };
        }),

      toggleTask: (taskId, xp) =>
        set((s) => {
          const done = s.tasksDone.includes(taskId);
          if (done) {
            return {
              tasksDone: s.tasksDone.filter((t) => t !== taskId),
              xp: Math.max(0, s.xp - xp),
            };
          }
          return { tasksDone: [...s.tasksDone, taskId], xp: s.xp + xp };
        }),

      claimDailyReward: () =>
        set((s) => {
          if (s.claimedDailyReward || s.tasksDone.length < 5) return {};
          return { claimedDailyReward: true, xp: s.xp + 50 };
        }),

      addXp: (amount) => set((s) => ({ xp: s.xp + amount })),

      setPracticeTab: (practiceTab) => set({ practiceTab }),
      setDictionaryQuery: (dictionaryQuery) => set({ dictionaryQuery }),
      setDictionaryFilter: (dictionaryFilter) => set({ dictionaryFilter }),

      setEnrollmentModalOpen: (enrollmentModalOpen) =>
        set({ enrollmentModalOpen }),
      setEnrollmentDetailOpen: (enrollmentDetailOpen) =>
        set({ enrollmentDetailOpen }),
      setIntensiveEnrolled: (intensiveEnrolled) => set({ intensiveEnrolled }),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebar: () =>
        set((st) => ({ sidebarCollapsed: !st.sidebarCollapsed })),
      toggleSidebarGroup: (id) =>
        set((st) => ({
          sidebarExpanded: {
            ...st.sidebarExpanded,
            [id]: !st.sidebarExpanded[id],
          },
        })),
      setSidebarGroupExpanded: (id, expanded) =>
        set((st) => ({
          sidebarExpanded: { ...st.sidebarExpanded, [id]: expanded },
        })),

      selectWorldCategory: (id) =>
        set((st) => ({
          selectedWorldCategoryId: id,
          previousPage: st.page,
          page: "category",
          selectedFeatureId: null,
          selectedP3Id: null,
        })),

      startWorldLesson: () =>
        set({
          lessonStep: 0,
          lessonPick: null,
          lessonResult: null,
          lessonXp: 0,
          lessonCorrect: 0,
          lessonMatched: [],
          lessonMatchPick: null,
          page: "lesson",
          selectedFeatureId: null,
          selectedP3Id: null,
        }),

      answerWorldLesson: (pick, correct) =>
        set((st) => {
          if (st.lessonResult) return {};
          if (pick === correct) {
            return {
              lessonPick: pick,
              lessonResult: "correct",
              lessonXp: st.lessonXp + 20,
              lessonCorrect: st.lessonCorrect + 1,
            };
          }
          return { lessonPick: pick, lessonResult: "wrong" };
        }),

      pickWorldMatch: (item) =>
        set((st) => {
          if (st.lessonMatched.includes(item)) return {};
          if (!st.lessonMatchPick) return { lessonMatchPick: item };
          if (st.lessonMatchPick === item) return {};
          const pairs = [
            ["谢谢", "Thank you"],
            ["你好", "Hello"],
            ["水", "Water"],
          ];
          const first = st.lessonMatchPick;
          const isPair = pairs.some(
            (p) => p.includes(first) && p.includes(item),
          );
          if (isPair) {
            const matched = [...st.lessonMatched, first, item];
            const done = matched.length >= 6;
            return {
              lessonMatched: matched,
              lessonMatchPick: null,
              lessonXp: st.lessonXp + 10,
              ...(done
                ? {
                    lessonResult: "correct",
                    lessonCorrect: st.lessonCorrect + 1,
                  }
                : {}),
            };
          }
          return { lessonMatchPick: null };
        }),

      nextWorldLessonStep: () =>
        set((st) => {
          if (st.lessonStep < 4) {
            return {
              lessonStep: st.lessonStep + 1,
              lessonPick: null,
              lessonResult: null,
              lessonMatched: [],
              lessonMatchPick: null,
            };
          }
          const earned = st.lessonXp + 40;
          const completedLessons = st.completedLessons.includes("Xièxie")
            ? st.completedLessons
            : [...st.completedLessons, "Xièxie"];
          return {
            xp: st.xp + earned,
            lessonsCompleted: st.lessonsCompleted + 1,
            completedLessons,
            page: "complete",
          };
        }),

      showToast: (msg) => {
        if (toastTimer) clearTimeout(toastTimer);
        set({ toast: msg });
        toastTimer = setTimeout(() => set({ toast: null }), 2600);
      },
      clearToast: () => set({ toast: null }),

      markSaving: () => {
        if (saveTimer) clearTimeout(saveTimer);
        set({ saveStatus: "saving" });
      },
      markSaved: () => {
        if (saveTimer) clearTimeout(saveTimer);
        set({ saveStatus: "saved" });
        saveTimer = setTimeout(() => set({ saveStatus: "idle" }), 1800);
      },
      markSaveError: () => {
        if (saveTimer) clearTimeout(saveTimer);
        set({ saveStatus: "error" });
        saveTimer = setTimeout(() => set({ saveStatus: "idle" }), 2200);
      },
    }),
    {
      name: "madara-modular-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
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
      }),
    },
  ),
);
