import { CATALOG } from "@/modules/catalog";

const PAGE_MAP: Record<string, string> = {
  public: "/home",
  onboarding: "/onboarding",
  home: "/home",
  "home-overview": "/home",
  "home-missions": "/home/missions",
  "home-stats": "/home/stats",
  "home-streak": "/home/streak",
  social: "/home",
  pavilions: "/home",
  "pavilion-detail": "/home",
  discussions: "/home",
  messages: "/home",
  notifications: "/home",
  events: "/home",
  "social-profile": "/home",
  moderation: "/home",
  library: "/dictionary/all",
  cultivation: "/home/stats",
  world: "/world",
  "world-explorer": "/world",
  "world-categories": "/world/categories",
  "world-progress": "/world/progress",
  category: "/world/greetings",
  lesson: "/world/greetings/lesson",
  complete: "/world/greetings/lesson/complete",
  practice: "/practice",
  "practice-flashcards": "/practice/flashcards",
  "practice-tone": "/practice/tone",
  "practice-vocab-review": "/practice/vocab-review",
  "practice-listening": "/practice/listening",
  "practice-daily-challenge": "/practice/daily-challenge",
  "practice-weak-topics": "/practice/weak-topics",
  dictionary: "/dictionary/all",
  "dictionary-all": "/dictionary/all",
  "dictionary-hsk1": "/dictionary/hsk1",
  "dictionary-hsk2": "/dictionary/hsk2",
  "dictionary-favorites": "/dictionary/favorites",
  profile: "/profile/overview",
  "profile-overview": "/profile/overview",
  "profile-achievements": "/profile/achievements",
  "profile-preferences": "/profile/preferences",
  "profile-account": "/profile/account",
  "feature-detail": "/home",
};

const CATALOG_IDS = new Set(CATALOG.map((c) => c.id));

export function legacyPageToHref(page: string | undefined): string {
  if (!page) return "/home";
  if (PAGE_MAP[page]) return PAGE_MAP[page];
  if (CATALOG_IDS.has(page as never)) return `/features/${page}`;
  if (page.startsWith("p3-")) return `/features/${page}`;
  return "/home";
}
