import type { LucideIcon } from "lucide-react";

/** The 54 catalog feature pages (sidebar "Semua Fitur" + feature modal). */
export type FeatureId =
  | "vocab-collection"
  | "flashcards"
  | "listening-center"
  | "pronunciation-lab"
  | "grammar-guide"
  | "learning-history"
  | "review-queue"
  | "saved-lessons"
  | "mistake-review"
  | "achievements"
  | "daily-missions"
  | "weekly-challenges"
  | "leaderboard"
  | "cultivation-ranking"
  | "rewards-shop"
  | "learning-stats"
  | "milestones"
  | "streak-history"
  | "forum"
  | "study-groups"
  | "friends"
  | "community-challenges"
  | "student-rankings"
  | "shared-vocab"
  | "materials"
  | "songs"
  | "reading-library"
  | "culture"
  | "tips"
  | "help"
  | "faq"
  | "intensive-class"
  | "class-schedule"
  | "live-sessions"
  | "meeting-history"
  | "recordings"
  | "class-materials"
  | "assignments"
  | "assignment-submissions"
  | "instructor-info"
  | "announcements"
  | "attendance"
  | "class-progress"
  | "assessments"
  | "notifications"
  | "language-prefs"
  | "learning-prefs"
  | "appearance"
  | "sound"
  | "reminders"
  | "privacy"
  | "account-mgmt"
  | "subscription"
  | "about";

export type BuiltInPageId =
  | "public"
  | "onboarding"
  | "home"
  | "home-overview"
  | "home-missions"
  | "home-stats"
  | "home-streak"
  | "social"
  | "pavilions"
  | "pavilion-detail"
  | "discussions"
  | "messages"
  | "notifications"
  | "events"
  | "social-profile"
  | "moderation"
  | "library"
  | "cultivation"
  | "world"
  | "world-explorer"
  | "world-categories"
  | "world-progress"
  | "category"
  | "lesson"
  | "complete"
  | "practice"
  | "practice-flashcards"
  | "practice-tone"
  | "practice-vocab-review"
  | "practice-listening"
  | "practice-daily-challenge"
  | "practice-weak-topics"
  | "dictionary"
  | "dictionary-all"
  | "dictionary-hsk1"
  | "dictionary-hsk2"
  | "dictionary-favorites"
  | "profile"
  | "profile-overview"
  | "profile-achievements"
  | "profile-preferences"
  | "profile-account"
  | "feature-detail";

export type PageId = BuiltInPageId | FeatureId;

export type PublicPageId =
  | "landing"
  | "about"
  | "pricing"
  | "programs"
  | "hsk"
  | "login"
  | "register"
  | "forgot";

export type Role = "Student" | "Moderator";
export type ThemeMode = "light" | "dark" | "system";

export type WorldTab =
  | "explorer"
  | "lesson"
  | "hanzi"
  | "pronunciation"
  | "exercises"
  | "tests"
  | "history"
  | "rewards";

export type CultivationTab =
  | "character"
  | "realms"
  | "quests"
  | "achievements"
  | "skills"
  | "leaderboard"
  | "history";

export type LibraryTab =
  | "vocab"
  | "grammar"
  | "reading"
  | "music"
  | "audio"
  | "saved";

export type PracticeTab =
  | "Flashcards"
  | "Tone Recognition"
  | "Vocab Review"
  | "Listening"
  | "Daily Challenge"
  | "Weak Topics";

export type PavilionTab = "About" | "Members" | "Discussions" | "Events";

/** Social feature pages (share the pill sub-nav). */
export const SOCIAL_PAGES: PageId[] = [
  "social",
  "pavilions",
  "pavilion-detail",
  "discussions",
  "messages",
  "notifications",
  "events",
  "social-profile",
  "moderation",
];

export interface VocabWord {
  hanzi: string;
  pinyin: string;
  /** Indonesian meaning (field name kept from the original source). */
  id: string;
  en: string;
  hsk: string;
  ex: string;
  exId: string;
}

export interface FeatureItem {
  id: FeatureId;
  group: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  action: string;
  actionPage: PageId;
}

export interface NavItem {
  id: PageId;
  label: string;
  icon: LucideIcon;
}

export interface SocialNavItem {
  id: PageId;
  label: string;
  icon: LucideIcon;
}

export interface Post {
  id: string;
  author: string;
  handle: string;
  pavilion: string;
  time: string;
  text: string;
  likes: number;
  comments: number;
  shares: number;
  liked: boolean;
  replies: string[];
}

export interface Pavilion {
  id: string;
  name: string;
  tag: string;
  members: number;
  desc: string;
  color: string;
  about: string;
  focus: string[];
}

export interface Discussion {
  id: string;
  title: string;
  pavilion: string;
  replies: number;
  author: string;
  time: string;
}

export interface Chat {
  id: string;
  name: string;
  last: string;
  time: string;
  unread: number;
  messages: string[];
}

export interface AppNotification {
  id: string;
  title: string;
  time: string;
  read: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  pavilion: string;
  going: number;
  desc: string;
}

export interface HskLevel {
  level: string;
  vocab: string;
  desc: string;
  focus: string;
}

export interface Lesson {
  id: string;
  cat: string;
  title: string;
  hanzi: string;
  pinyin: string;
  mins: number;
  xp: number;
  objectives: string[];
  vocab: string[];
}

export interface World {
  id: number;
  title: string;
  desc: string;
  progress: number;
  locked: boolean;
  tag: string;
}

export interface DictionaryEntry {
  hanzi: string;
  pinyin: string;
  tone: string;
  meaningEn: string;
  meaningId: string;
  stroke: string;
  example: string;
  exampleId: string;
}

export interface GrammarTopic {
  id: string;
  title: string;
  level: string;
  structure: string;
  desc: string;
  examples: string[];
}

export interface Reading {
  id: string;
  title: string;
  level: string;
  mins: number;
  preview: string;
}

export interface Song {
  id: string;
  title: string;
  level: string;
  lyric: string;
}

export interface AudioItem {
  id: string;
  title: string;
  level: string;
  mins: number;
  desc: string;
}

export interface Realm {
  id: string;
  name: string;
  level: string;
  xp: string;
  status: string;
  locked: boolean;
}

export interface Quest {
  id: string;
  title: string;
  xp: number;
  type: "Daily" | "Weekly";
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  unlocked: boolean;
  progress?: number;
}

export interface Skill {
  name: string;
  v: number;
  desc: string;
}

export interface LeaderboardEntry {
  name: string;
  xp: number;
}

export interface Milestone {
  date: string;
  title: string;
  desc: string;
}

export interface Reward {
  title: string;
  xp: string;
  when: string;
}

export interface TestItem {
  id: string;
  title: string;
  qs: number;
  mins: number;
  xp: number;
  desc: string;
}

export interface ModerationReport {
  id: string;
  text: string;
  status: string;
}

export type LessonQuestion =
  | {
      type: "Hanzi";
      title: string;
      hanzi: string;
      pinyin: string;
      tone: string;
      desc: string;
    }
  | { type: "Pilihan Ganda"; title: string; options: string[]; correct: string }
  | { type: "Tone ID"; title: string; options: string[]; correct: string }
  | { type: "Match"; title: string; pairs: [string, string][] }
  | { type: "Listening"; title: string; options: string[]; correct: string };

export interface SidebarChildNavItem {
  id: PageId;
  label: string;
}

export interface SidebarNavItem {
  id: PageId;
  label: string;
  icon: LucideIcon;
  landingPageId: PageId;
  children: SidebarChildNavItem[];
}
