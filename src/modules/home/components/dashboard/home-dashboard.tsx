"use client";

import { useMemo, useState } from "react";
import { useHomeDashboard } from "../../hooks/use-home-dashboard";
import { ContinueLearningCard } from "./continue-learning-card";
import { CultivationProfileCard } from "./cultivation-profile-card";
import { DailyMissionsPanel } from "./daily-missions-panel";
import { DiscoverExploreSection } from "./discover-explore-section";
import { LearningMasteryOverview } from "./learning-mastery-overview";
import { LearningRemindersCard } from "./learning-reminders-card";
import { RoadmapPreview } from "./roadmap-preview";

export function HomeDashboard() {
  const data = useHomeDashboard();
  const [missionOverrides, setMissionOverrides] = useState<
    Record<string, boolean>
  >({});

  const missions = useMemo(
    () =>
      data.missions.items.map((mission) => ({
        ...mission,
        completed: missionOverrides[mission.id] ?? mission.completed,
      })),
    [data.missions.items, missionOverrides],
  );

  const completed = missions.filter((m) => m.completed).length;

  const toggleMission = (missionId: string) => {
    setMissionOverrides((prev) => {
      const current =
        prev[missionId] ??
        data.missions.items.find((m) => m.id === missionId)?.completed ??
        false;
      return { ...prev, [missionId]: !current };
    });
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6 pb-2">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[var(--muted)]">
            Welcome back, {data.profile.greetingName}!
          </p>
          <h1 className="text-3xl font-black tracking-tight text-[var(--ink)] sm:text-[2rem]">
            Your learning command center
          </h1>
          <p className="max-w-2xl text-sm text-[var(--muted)] sm:text-base">
            Track your progress, focus on the next right lesson, and keep your
            Mandarin journey moving forward.
          </p>
        </div>
        <div className="lg:hidden">
          <div className="inline-flex items-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm font-bold text-[var(--muted)]">
            {data.profile.rank} · Level{" "}
            {String(data.profile.level).padStart(2, "0")}
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)] xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          <div className="lg:hidden">
            <CultivationProfileCard profile={data.profile} compact />
          </div>

          <ContinueLearningCard recommendation={data.recommendation} />

          <div className="lg:hidden">
            <DailyMissionsPanel
              completed={completed}
              total={missions.length}
              missions={missions}
              onToggleMission={toggleMission}
            />
          </div>

          <RoadmapPreview
            title={data.roadmap.title}
            summary={data.roadmap.summary}
            nodes={data.roadmap.nodes}
            fullRoadmapHref={data.roadmap.fullRoadmapHref}
          />

          <LearningMasteryOverview skills={data.mastery} />

          <div className="lg:hidden">
            <LearningRemindersCard reminders={data.reminders} />
          </div>
        </div>

        <aside
          className="hidden min-w-0 space-y-6 lg:block"
          aria-label="Dashboard sidebar"
        >
          <CultivationProfileCard profile={data.profile} />
          <DailyMissionsPanel
            completed={completed}
            total={missions.length}
            missions={missions}
            onToggleMission={toggleMission}
          />
          <LearningRemindersCard reminders={data.reminders} />
        </aside>
      </div>

      <DiscoverExploreSection items={data.discover} />
    </div>
  );
}
