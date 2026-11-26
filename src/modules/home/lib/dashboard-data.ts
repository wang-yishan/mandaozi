import type {
  DailyMission,
  DashboardRecommendation,
  HomeDashboardData,
  LearningRecommendationState,
  RoadmapPreviewNode,
  SkillMastery,
} from "../types/dashboard";

export interface HomeDashboardSource {
  xp: number;
  streakDays: number;
  accuracy: number;
  wordsMastered: number;
  lessonsCompleted: number;
  tasksDone: string[];
  completedLessons: string[];
  level: string;
  goal: string;
}

const MISSION_TEMPLATE: Array<Omit<DailyMission, "completed">> = [
  {
    id: "learn-lesson",
    category: "learn",
    title: "Complete One Lesson",
    xpReward: 20,
    estimatedMinutes: 10,
    href: "/world/greetings/lesson",
    reasonTag: "stage",
  },
  {
    id: "pronunciation-practice",
    category: "practice",
    title: "Practice Pronunciation",
    xpReward: 15,
    estimatedMinutes: 8,
    href: "/practice/tone",
    reasonTag: "weak_skill",
  },
  {
    id: "hanzi-review",
    category: "review",
    title: "Review 10 Hanzi",
    xpReward: 15,
    estimatedMinutes: 6,
    href: "/practice/flashcards",
    reasonTag: "review_due",
  },
  {
    id: "vocab-assessment",
    category: "assessment",
    title: "Complete Vocabulary Quiz",
    xpReward: 20,
    estimatedMinutes: 7,
    href: "/practice/vocab-review",
    reasonTag: "history",
  },
];

function getRecommendationState(
  source: HomeDashboardSource,
): LearningRecommendationState {
  if (source.lessonsCompleted <= 0 && source.completedLessons.length === 0)
    return "new";
  if (source.accuracy < 70) return "weak";
  if (source.tasksDone.length > 0 && source.tasksDone.length < 3)
    return "review";
  if (source.completedLessons.length > 0) return "continue";
  return "continue";
}

function buildRecommendation(
  source: HomeDashboardSource,
): DashboardRecommendation {
  const state = getRecommendationState(source);
  const base = {
    id: "next-learning-step",
    lessonId: "tones-lesson-04",
    category: "Pronunciation Foundation",
    title: "Master Mandarin Tones",
    stageLabel: "Pronunciation Foundation · Lesson 04",
    objective:
      "Learn the four Mandarin tones and understand how pitch changes meaning.",
    estimatedMinutes: 10,
    href: "/world/greetings/lesson",
  };

  const byState: Record<
    LearningRecommendationState,
    Pick<
      DashboardRecommendation,
      "state" | "progressPercent" | "reason" | "ctaLabel"
    >
  > = {
    new: {
      state,
      progressPercent: 0,
      reason:
        "You’re starting fresh. This first lesson builds the tone foundation you’ll use in every conversation.",
      ctaLabel: "Start Your First Lesson",
    },
    continue: {
      state,
      progressPercent: 60,
      reason:
        "You have completed Pinyin initials. Now it is time to strengthen your tone recognition.",
      ctaLabel: "Continue Learning",
    },
    review: {
      state,
      progressPercent: 45,
      reason:
        "Your recent activity shows a few concepts need reinforcement before moving forward.",
      ctaLabel: "Review Recommended",
    },
    weak: {
      state,
      progressPercent: 35,
      reason:
        "Recent assessment signals suggest tone recognition needs attention. A focused lesson will help most.",
      ctaLabel: "Improve Your Skills",
    },
    completed_stage: {
      state,
      progressPercent: 100,
      reason:
        "You’ve completed this stage. The next stage introduces vocabulary you can use immediately.",
      ctaLabel: "Explore Next Stage",
    },
  };

  return { ...base, ...byState[state] };
}

function buildRoadmapNodes(source: HomeDashboardSource): RoadmapPreviewNode[] {
  const completedFoundation =
    source.completedLessons.length > 0 || source.lessonsCompleted > 0;
  return [
    {
      id: "pinyin-foundation",
      title: "Pinyin Foundation",
      status: completedFoundation ? "completed" : "current",
      progressPercent: completedFoundation ? 100 : 35,
      href: "/roadmaps",
    },
    {
      id: "pronunciation-tones",
      title: "Pronunciation & Tones",
      status: completedFoundation ? "current" : "available",
      progressPercent: completedFoundation ? 60 : 0,
      href: "/roadmaps",
    },
    {
      id: "hsk1-vocabulary",
      title: "HSK 1 Vocabulary",
      status: completedFoundation ? "available" : "locked",
      prerequisiteLabel: "Complete Pronunciation & Tones to unlock this stage.",
      href: "/roadmaps",
    },
    {
      id: "basic-grammar",
      title: "Basic Grammar",
      status: "locked",
      prerequisiteLabel: "Complete HSK 1 Vocabulary to unlock this stage.",
      href: "/roadmaps",
    },
  ];
}

function buildMissions(source: HomeDashboardSource): DailyMission[] {
  const completedIds = new Set(source.tasksDone);
  return MISSION_TEMPLATE.map((mission, index) => {
    const fallbackCompleted = index < Math.min(source.tasksDone.length, 2);
    return {
      ...mission,
      completed: completedIds.has(mission.id) || fallbackCompleted,
    };
  });
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function buildMastery(source: HomeDashboardSource): SkillMastery[] {
  const base = clampScore(source.accuracy);
  return [
    {
      id: "hanzi",
      label: "Hanzi Recognition",
      score: clampScore(base - 8 + Math.min(12, source.wordsMastered / 20)),
      lastAssessedAt: "Today",
      trend: "up",
      note: "Based on recent character review and recognition exercises.",
    },
    {
      id: "vocabulary",
      label: "Vocabulary",
      score: clampScore(base - 2 + Math.min(10, source.wordsMastered / 25)),
      lastAssessedAt: "Today",
      trend: "stable",
      note: "Reflects word recall across lessons and review sessions.",
    },
    {
      id: "pronunciation",
      label: "Pronunciation",
      score: clampScore(base - 14),
      lastAssessedAt: "Yesterday",
      trend: "up",
      recommended: true,
      note: "Tone accuracy needs focused practice before the next stage.",
    },
    {
      id: "listening",
      label: "Listening",
      score: clampScore(base - 10),
      lastAssessedAt: "2 days ago",
      trend: "stable",
      note: "Comprehension is improving; short daily listening helps.",
    },
    {
      id: "grammar",
      label: "Grammar",
      score: clampScore(base - 18),
      lastAssessedAt: "3 days ago",
      trend: "down",
      recommended: true,
      note: "Sentence patterns need reinforcement through guided practice.",
    },
    {
      id: "reading",
      label: "Reading",
      score: clampScore(base - 6),
      lastAssessedAt: "Today",
      trend: "up",
      note: "Reading confidence is growing with familiar vocabulary.",
    },
  ];
}

export function getHomeDashboardData(
  source: HomeDashboardSource,
): HomeDashboardData {
  const recommendation = buildRecommendation(source);
  const missions = buildMissions(source);
  const completed = missions.filter((m) => m.completed).length;
  const currentExp = source.xp % 1000;
  const level = Math.max(1, Math.floor(source.xp / 1000) + 1);

  return {
    profile: {
      name: "Ikhsan",
      greetingName: "Cultivator",
      avatarLabel: "I",
      rank: "Qi Refining",
      level,
      currentExp,
      nextLevelExp: 1000,
      streakDays: source.streakDays,
      diamonds: 35,
      notificationCount: 3,
    },
    recommendation,
    roadmap: {
      title: "Learning Roadmap",
      summary: "A compact view of your current Mandarin journey.",
      nodes: buildRoadmapNodes(source),
      fullRoadmapHref: "/roadmaps",
    },
    missions: {
      completed,
      total: missions.length,
      items: missions,
    },
    mastery: buildMastery(source),
    discover: [
      {
        id: "hanzi-library",
        title: "Hanzi Library",
        description: "Explore characters, radicals, and meanings.",
        href: "/dictionary/all",
        icon: "hanzi",
      },
      {
        id: "pronunciation-lab",
        title: "Pronunciation Lab",
        description: "Train tones, initials, and finals with feedback.",
        href: "/practice/tone",
        icon: "pronunciation",
      },
      {
        id: "music",
        title: "Learn Through Music",
        description: "Pick up rhythm and vocabulary through songs.",
        href: "/features",
        icon: "music",
      },
      {
        id: "writing-practice",
        title: "Writing Practice",
        description: "Build stroke confidence and character memory.",
        href: "/features",
        icon: "writing",
      },
      {
        id: "vocabulary-explorer",
        title: "Vocabulary Explorer",
        description: "Discover useful words by topic and HSK level.",
        href: "/dictionary/hsk1",
        icon: "vocabulary",
      },
      {
        id: "cultural-insights",
        title: "Cultural Insights",
        description: "Learn language through culture and context.",
        href: "/features",
        icon: "culture",
      },
    ],
    reminders: [
      {
        id: "review-due",
        title: "Review due",
        detail: "10 Hanzi are ready for spaced review.",
        href: "/practice/flashcards",
        kind: "review",
      },
      {
        id: "tone-check",
        title: "Skill check",
        detail: "A short pronunciation assessment can update your mastery.",
        href: "/practice/tone",
        kind: "assessment",
      },
      {
        id: "streak",
        title: "Keep your streak",
        detail: `You're on a ${source.streakDays}-day streak. Complete one mission today.`,
        href: "/home/missions",
        kind: "streak",
      },
    ],
  };
}
