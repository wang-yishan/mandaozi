"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createLessonProgress, updateLessonProgress } from "./lib/progress";
import type {
  AudioVariant,
  IncorrectAnswer,
  LessonProgress,
  PhonicsDisplayMode,
  PhonicsProgressState,
  PlaybackRate,
} from "./types";

interface PhonicsStore extends PhonicsProgressState {
  setDisplayMode: (mode: PhonicsDisplayMode) => void;
  setAccent: (accent: AudioVariant) => void;
  setPlaybackRate: (rate: PlaybackRate) => void;
  recordLessonResult: (args: {
    lessonId: string;
    score: number;
    accuracy: number;
    xpEarned: number;
    incorrectExerciseIds: string[];
    incorrectAnswers: IncorrectAnswer[];
  }) => void;
  resolveIncorrectAnswer: (id: string) => void;
  clearResolvedIncorrectAnswers: () => void;
  resetPhonicsProgress: () => void;
}

const initialState: PhonicsProgressState = {
  displayMode: "both",
  selectedAccent: "putonghua",
  playbackRate: 1,
  lessonProgress: {},
  symbolProgress: {},
  incorrectAnswers: [],
  totalXp: 0,
};

export const usePhonicsStore = create<PhonicsStore>()(
  persist(
    (set) => ({
      ...initialState,
      setDisplayMode: (displayMode) => set({ displayMode }),
      setAccent: (selectedAccent) => set({ selectedAccent }),
      setPlaybackRate: (playbackRate) => set({ playbackRate }),
      recordLessonResult: ({
        lessonId,
        score,
        accuracy,
        xpEarned,
        incorrectExerciseIds,
        incorrectAnswers,
      }) =>
        set((state) => {
          const prev: LessonProgress | undefined =
            state.lessonProgress[lessonId];
          const next = updateLessonProgress(
            prev,
            accuracy,
            score,
            incorrectExerciseIds,
          );
          return {
            lessonProgress: { ...state.lessonProgress, [lessonId]: next },
            incorrectAnswers: [
              ...incorrectAnswers,
              ...state.incorrectAnswers,
            ].slice(0, 200),
            totalXp: state.totalXp + xpEarned,
          };
        }),
      resolveIncorrectAnswer: (id) =>
        set((state) => ({
          incorrectAnswers: state.incorrectAnswers.map((a) =>
            a.id === id ? { ...a, resolved: true } : a,
          ),
        })),
      clearResolvedIncorrectAnswers: () =>
        set((state) => ({
          incorrectAnswers: state.incorrectAnswers.filter((a) => !a.resolved),
        })),
      resetPhonicsProgress: () => set(initialState),
    }),
    {
      name: "mandaozi-phonics-v1",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            },
      ),
      partialize: (s) => ({
        displayMode: s.displayMode,
        selectedAccent: s.selectedAccent,
        playbackRate: s.playbackRate,
        lessonProgress: s.lessonProgress,
        symbolProgress: s.symbolProgress,
        incorrectAnswers: s.incorrectAnswers,
        totalXp: s.totalXp,
      }),
    },
  ),
);

export function getLessonProgressState(
  state: PhonicsProgressState,
  lessonId: string,
) {
  return state.lessonProgress[lessonId] ?? createLessonProgress();
}
