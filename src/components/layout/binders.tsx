"use client";

import { useEffect, useRef } from "react";
import { useMadaraStore } from "@/store/madara-store";

export function ThemeBinder() {
  const themeMode = useMadaraStore((s) => s.themeMode);
  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark =
        themeMode === "dark" || (themeMode === "system" && mq.matches);
      root.classList.toggle("dark", dark);
      const el = document.querySelector(".app-theme");
      if (el instanceof HTMLElement) el.dataset.theme = dark ? "dark" : "light";
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [themeMode]);
  return null;
}

export function SaveFeedbackBinder() {
  const markSaving = useMadaraStore((s) => s.markSaving);
  const markSaved = useMadaraStore((s) => s.markSaved);
  const hydrated = useRef(false);
  useEffect(() => {
    // Skip initial hydration-triggered persist writes.
    const t = setTimeout(() => {
      hydrated.current = true;
    }, 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsub = useMadaraStore.subscribe((state, prev) => {
      if (!hydrated.current) return;
      const keys: (keyof typeof state)[] = [
        "xp",
        "wordsMastered",
        "lessonsCompleted",
        "streakDays",
        "accuracy",
        "favorites",
        "tasksDone",
        "claimedDailyReward",
        "completedLessons",
        "themeMode",
        "goal",
        "level",
        "dailyGoal",
        "reminders",
        "sound",
        "language",
        "onboardingDone",
      ];
      const changed = keys.some((k) => state[k] !== prev[k]);
      if (!changed) return;
      markSaving();
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => markSaved(), 450);
    });
    return () => {
      unsub();
      if (timer) clearTimeout(timer);
    };
  }, [markSaving, markSaved]);
  return null;
}
