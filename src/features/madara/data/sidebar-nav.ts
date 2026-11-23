import { BookOpen, Dumbbell, Globe, Home, User } from "lucide-react";
import type { PageId, SidebarNavItem } from "../types";

export const SIDEBAR_NAV: SidebarNavItem[] = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    landingPageId: "home-overview",
    children: [
      { id: "home-overview", label: "Overview" },
      { id: "home-missions", label: "Daily Missions" },
      { id: "home-stats", label: "Learning Stats" },
      { id: "home-streak", label: "Streak History" },
    ],
  },
  {
    id: "world",
    label: "World",
    icon: Globe,
    landingPageId: "world-explorer",
    children: [
      { id: "world-explorer", label: "World Explorer" },
      { id: "world-categories", label: "Category Journey" },
      { id: "world-progress", label: "Lesson Progress" },
    ],
  },
  {
    id: "practice",
    label: "Practice",
    icon: Dumbbell,
    landingPageId: "practice",
    children: [
      { id: "practice-flashcards", label: "Flashcards" },
      { id: "practice-tone", label: "Tone Recognition" },
      { id: "practice-vocab-review", label: "Vocab Review" },
      { id: "practice-listening", label: "Listening" },
      { id: "practice-daily-challenge", label: "Daily Challenge" },
      { id: "practice-weak-topics", label: "Weak Topics" },
    ],
  },
  {
    id: "dictionary",
    label: "Dictionary",
    icon: BookOpen,
    landingPageId: "dictionary-all",
    children: [
      { id: "dictionary-all", label: "All Words" },
      { id: "dictionary-hsk1", label: "HSK 1" },
      { id: "dictionary-hsk2", label: "HSK 2" },
      { id: "dictionary-favorites", label: "Favorites" },
    ],
  },
  {
    id: "profile",
    label: "Profile",
    icon: User,
    landingPageId: "profile-overview",
    children: [
      { id: "profile-overview", label: "Profile Overview" },
      { id: "profile-achievements", label: "Achievements" },
      { id: "profile-preferences", label: "Learning Preferences" },
      { id: "profile-account", label: "Account & Settings" },
    ],
  },
];

export const SIDEBAR_PARENTS = SIDEBAR_NAV.map((item) => item.id);

const WORLD_FLOW_PAGES: PageId[] = ["category", "lesson", "complete"];

export function getSidebarParent(page: PageId): SidebarNavItem | undefined {
  if (WORLD_FLOW_PAGES.includes(page)) {
    return SIDEBAR_NAV.find((item) => item.id === "world");
  }
  return SIDEBAR_NAV.find(
    (item) =>
      item.id === page ||
      item.landingPageId === page ||
      item.children.some((child) => child.id === page),
  );
}

export function isSidebarChildPage(page: PageId, parentId: PageId): boolean {
  const parent = SIDEBAR_NAV.find((item) => item.id === parentId);
  if (!parent) return false;
  return (
    page === parent.id ||
    page === parent.landingPageId ||
    parent.children.some((child) => child.id === page)
  );
}

export function getSidebarChildLabel(page: PageId): string | undefined {
  for (const parent of SIDEBAR_NAV) {
    const child = parent.children.find((item) => item.id === page);
    if (child) return child.label;
  }
  return undefined;
}
