export type LearningRecommendationState =
  | "new"
  | "continue"
  | "review"
  | "weak"
  | "completed_stage";

export interface DashboardRecommendation {
  id: string;
  state: LearningRecommendationState;
  lessonId: string;
  category: string;
  title: string;
  stageLabel: string;
  objective: string;
  estimatedMinutes: number;
  progressPercent?: number;
  reason: string;
  ctaLabel: string;
  href: string;
}

export type RoadmapPreviewStatus =
  | "completed"
  | "current"
  | "available"
  | "locked"
  | "mastered"
  | "review_required"
  | "in-progress"
  | "recommended";

export interface RoadmapPreviewNode {
  id: string;
  title: string;
  status: RoadmapPreviewStatus;
  progressPercent?: number;
  prerequisiteLabel?: string;
  href?: string;
}

export type MissionCategory =
  | "learn"
  | "practice"
  | "review"
  | "assessment"
  | "challenge";

export interface DailyMission {
  id: string;
  category: MissionCategory;
  title: string;
  xpReward: number;
  estimatedMinutes: number;
  completed: boolean;
  href: string;
  reasonTag?: "stage" | "weak_skill" | "review_due" | "history";
}

export type MasterySkillId =
  | "hanzi"
  | "vocabulary"
  | "pronunciation"
  | "listening"
  | "grammar"
  | "reading";

export interface SkillMastery {
  id: MasterySkillId;
  label: string;
  score: number;
  lastAssessedAt: string;
  trend: "up" | "down" | "stable";
  recommended?: boolean;
  note: string;
}

export interface CultivationProfile {
  name: string;
  greetingName: string;
  avatarLabel: string;
  rank: string;
  level: number;
  currentExp: number;
  nextLevelExp: number;
  streakDays: number;
  diamonds: number;
  notificationCount: number;
}

export interface DiscoverItem {
  id: string;
  title: string;
  description: string;
  href: string;
  icon:
    | "hanzi"
    | "pronunciation"
    | "music"
    | "writing"
    | "vocabulary"
    | "culture";
}

export interface LearningReminder {
  id: string;
  title: string;
  detail: string;
  href: string;
  kind: "review" | "assessment" | "streak" | "event";
}

export interface HomeDashboardData {
  profile: CultivationProfile;
  recommendation: DashboardRecommendation;
  roadmap: {
    title: string;
    summary: string;
    nodes: RoadmapPreviewNode[];
    fullRoadmapHref: string;
  };
  missions: {
    completed: number;
    total: number;
    items: DailyMission[];
  };
  mastery: SkillMastery[];
  discover: DiscoverItem[];
  reminders: LearningReminder[];
}
