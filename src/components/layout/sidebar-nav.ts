import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Dumbbell,
  Globe,
  Home,
  Map as MapIcon,
  Settings,
  SlidersHorizontal,
  Trophy,
  User,
  UserRound,
} from "lucide-react";

export interface SidebarChildNavItem {
  id: string;
  label: string;
  href: string;
  icon?: LucideIcon;
}

export interface SidebarNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  children: SidebarChildNavItem[];
}

export const SIDEBAR_NAV: SidebarNavItem[] = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    href: "/home",
    children: [
      { id: "home-overview", label: "Overview", href: "/home" },
      { id: "home-missions", label: "Daily Missions", href: "/home/missions" },
      { id: "home-stats", label: "Learning Stats", href: "/home/stats" },
      { id: "home-streak", label: "Streak History", href: "/home/streak" },
    ],
  },
  {
    id: "world",
    label: "World",
    icon: Globe,
    href: "/world",
    children: [
      { id: "world-explorer", label: "World Explorer", href: "/world" },
      {
        id: "world-categories",
        label: "Category Journey",
        href: "/world/categories",
      },
      {
        id: "world-progress",
        label: "Lesson Progress",
        href: "/world/progress",
      },
      { id: "world-dao", label: "Dao", href: "/world/dao" },
    ],
  },
  {
    id: "roadmaps",
    label: "Roadmaps",
    icon: MapIcon,
    href: "/roadmaps",
    children: [
      { id: "roadmaps-overview", label: "Overview", href: "/roadmaps" },
    ],
  },
  {
    id: "practice",
    label: "Practice",
    icon: Dumbbell,
    href: "/practice",
    children: [
      {
        id: "practice-flashcards",
        label: "Flashcards",
        href: "/practice/flashcards",
      },
      {
        id: "practice-pinyin-zhuyin",
        label: "Pinyin & Zhuyin",
        href: "/practice/pinyin-zhuyin",
      },
      {
        id: "practice-tone",
        label: "Tone Recognition",
        href: "/practice/tone",
      },
      {
        id: "practice-vocab-review",
        label: "Vocab Review",
        href: "/practice/vocab-review",
      },
      {
        id: "practice-listening",
        label: "Listening",
        href: "/practice/listening",
      },
      {
        id: "practice-daily-challenge",
        label: "Daily Challenge",
        href: "/practice/daily-challenge",
      },
      {
        id: "practice-weak-topics",
        label: "Weak Topics",
        href: "/practice/weak-topics",
      },
    ],
  },
  {
    id: "dictionary",
    label: "Dictionary",
    icon: BookOpen,
    href: "/dictionary",
    children: [
      { id: "dictionary-all", label: "All Words", href: "/dictionary/all" },
      { id: "dictionary-hsk1", label: "HSK 1", href: "/dictionary/hsk1" },
      { id: "dictionary-hsk2", label: "HSK 2", href: "/dictionary/hsk2" },
      {
        id: "dictionary-favorites",
        label: "Favorites",
        href: "/dictionary/favorites",
      },
    ],
  },
  {
    id: "profile",
    label: "Profile",
    icon: User,
    href: "/profile",
    children: [
      {
        id: "profile-overview",
        label: "Profile Overview",
        href: "/profile/overview",
        icon: UserRound,
      },
      {
        id: "profile-achievements",
        label: "Achievements",
        href: "/profile/achievements",
        icon: Trophy,
      },
      {
        id: "profile-preferences",
        label: "Learning Preferences",
        href: "/profile/preferences",
        icon: SlidersHorizontal,
      },
      {
        id: "profile-account",
        label: "Account & Settings",
        href: "/profile/account",
        icon: Settings,
      },
    ],
  },
];

export const SIDEBAR_PARENTS = SIDEBAR_NAV.map((item) => item.id);

function normalize(pathname: string): string {
  if (!pathname) return "/";
  const p = pathname.split("?")[0];
  return p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;
}

export function getSidebarParent(pathname: string): SidebarNavItem | undefined {
  const p = normalize(pathname);
  if (p.startsWith("/world"))
    return SIDEBAR_NAV.find((item) => item.id === "world");
  return SIDEBAR_NAV.find(
    (item) =>
      p === item.href ||
      p.startsWith(`${item.href}/`) ||
      item.children.some(
        (child) => p === child.href || p.startsWith(`${child.href}/`),
      ),
  );
}

export function getSidebarChildLabel(pathname: string): string | undefined {
  const p = normalize(pathname);
  for (const parent of SIDEBAR_NAV) {
    const child = parent.children.find((item) => p === item.href);
    if (child) return child.label;
  }
  return undefined;
}

export function isSidebarChildActive(pathname: string, href: string): boolean {
  const p = normalize(pathname);
  const h = normalize(href);
  return p === h;
}
