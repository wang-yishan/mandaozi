"use client";

import { useMemo } from "react";
import { useMadaraStore } from "@/store/madara-store";
import { getHomeDashboardData } from "../lib/dashboard-data";

export function useHomeDashboard() {
  const xp = useMadaraStore((s) => s.xp);
  const streakDays = useMadaraStore((s) => s.streakDays);
  const accuracy = useMadaraStore((s) => s.accuracy);
  const wordsMastered = useMadaraStore((s) => s.wordsMastered);
  const lessonsCompleted = useMadaraStore((s) => s.lessonsCompleted);
  const tasksDone = useMadaraStore((s) => s.tasksDone);
  const completedLessons = useMadaraStore((s) => s.completedLessons);
  const level = useMadaraStore((s) => s.level);
  const goal = useMadaraStore((s) => s.goal);

  return useMemo(
    () =>
      getHomeDashboardData({
        xp,
        streakDays,
        accuracy,
        wordsMastered,
        lessonsCompleted,
        tasksDone,
        completedLessons,
        level,
        goal,
      }),
    [
      xp,
      streakDays,
      accuracy,
      wordsMastered,
      lessonsCompleted,
      tasksDone,
      completedLessons,
      level,
      goal,
    ],
  );
}
