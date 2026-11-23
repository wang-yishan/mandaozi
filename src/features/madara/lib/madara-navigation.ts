"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { CATALOG } from "../data/catalog";
import type { PageId } from "../types";

export const MADARA_PAGE_PARAM = "page";

const BUILTIN_PAGES: PageId[] = [
  "public",
  "onboarding",
  "home",
  "home-overview",
  "home-missions",
  "home-stats",
  "home-streak",
  "social",
  "pavilions",
  "pavilion-detail",
  "discussions",
  "messages",
  "notifications",
  "events",
  "social-profile",
  "moderation",
  "library",
  "cultivation",
  "world",
  "world-explorer",
  "world-categories",
  "world-progress",
  "category",
  "lesson",
  "complete",
  "practice",
  "practice-flashcards",
  "practice-tone",
  "practice-vocab-review",
  "practice-listening",
  "practice-daily-challenge",
  "practice-weak-topics",
  "dictionary",
  "dictionary-all",
  "dictionary-hsk1",
  "dictionary-hsk2",
  "dictionary-favorites",
  "profile",
  "profile-overview",
  "profile-achievements",
  "profile-preferences",
  "profile-account",
  "feature-detail",
];

const VALID_PAGES = new Set<PageId>([
  ...BUILTIN_PAGES,
  ...CATALOG.map((item) => item.id),
]);

export function isValidPageId(value: string | null): value is PageId {
  return !!value && VALID_PAGES.has(value as PageId);
}

export function buildMadaraHref(page: PageId): string {
  const params = new URLSearchParams();
  params.set(MADARA_PAGE_PARAM, page);
  return `/madara?${params.toString()}`;
}

export function useMadaraNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const navigateToPage = useCallback(
    (page: PageId) => {
      const href = buildMadaraHref(page);
      const current = `${pathname}?${searchParams.toString()}`;
      const currentPath =
        pathname === "/madara"
          ? current
          : `${pathname}?${searchParams.toString()}`;
      if (currentPath === href) return;
      router.push(href, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return { navigateToPage };
}
