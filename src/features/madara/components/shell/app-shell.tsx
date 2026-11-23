"use client";

import {
  BookOpen,
  Dumbbell,
  Globe,
  Home,
  LayoutGrid,
  MoreHorizontal,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getCatalogItem } from "../../data/catalog";
import { getSidebarParent, SIDEBAR_NAV } from "../../data/sidebar-nav";
import { useMadaraStore } from "../../store/madara-store";
import type { FeatureId } from "../../types";
import { AllFeaturesDrawer } from "../catalog/all-features-drawer";
import { FeatureDetailPage } from "../catalog/feature-detail";
import { AllWordsPage } from "../dictionary/all-words-page";
import { DictionaryPage } from "../dictionary/dictionary-page";
import { FavoritesPage } from "../dictionary/favorites-page";
import { Hsk1Page } from "../dictionary/hsk1-page";
import { Hsk2Page } from "../dictionary/hsk2-page";
import { EnrollmentModal } from "../enrollment/intensive-gate";
import { HomeMissionsPage } from "../home/home-missions-page";
import { HomePage } from "../home/home-page";
import { HomeStatsPage } from "../home/home-stats-page";
import { HomeStreakPage } from "../home/home-streak-page";
import { DailyChallengePage } from "../practice/daily-challenge-page";
import { FlashcardsPage } from "../practice/flashcards-page";
import { ListeningPage } from "../practice/listening-page";
import { PracticePage } from "../practice/practice-page";
import { ToneRecognitionPage } from "../practice/tone-recognition-page";
import { VocabReviewPage } from "../practice/vocab-review-page";
import { WeakTopicsPage } from "../practice/weak-topics-page";
import { ProfileAccountPage } from "../profile/profile-account-page";
import { ProfileAchievementsPage } from "../profile/profile-achievements-page";
import { ProfileOverviewPage } from "../profile/profile-overview-page";
import { ProfilePage } from "../profile/profile-page";
import { ProfilePreferencesPage } from "../profile/profile-preferences-page";
import { SaveIndicator } from "../ui/save-indicator";
import { Toast } from "../ui/toast";
import { WorldCategoriesPage } from "../world/world-categories-page";
import { WorldExplorerPage } from "../world/world-explorer-page";
import { CategoryPage, CompletePage, LessonPage } from "../world/world-page";
import { WorldProgressPage } from "../world/world-progress-page";
import { SaveFeedbackBinder, ThemeBinder } from "./binders";
import { DesktopSidebar } from "./desktop-sidebar";

const MOBILE_NAV = [
  { id: "home-overview", label: "Home", icon: Home, parent: "home" },
  { id: "world-explorer", label: "World", icon: Globe, parent: "world" },
  { id: "practice", label: "Practice", icon: Dumbbell, parent: "practice" },
  {
    id: "dictionary-all",
    label: "Dictionary",
    icon: BookOpen,
    parent: "dictionary",
  },
] as const;

function PageRouter() {
  const page = useMadaraStore((s) => s.page);
  if (page === "home" || page === "home-overview") return <HomePage />;
  if (page === "home-missions") return <HomeMissionsPage />;
  if (page === "home-stats") return <HomeStatsPage />;
  if (page === "home-streak") return <HomeStreakPage />;

  if (page === "world" || page === "world-explorer")
    return <WorldExplorerPage />;
  if (page === "world-categories") return <WorldCategoriesPage />;
  if (page === "world-progress") return <WorldProgressPage />;
  if (page === "category") return <CategoryPage />;
  if (page === "lesson") return <LessonPage />;
  if (page === "complete") return <CompletePage />;

  if (page === "practice") return <PracticePage />;
  if (page === "practice-flashcards") return <FlashcardsPage />;
  if (page === "practice-tone") return <ToneRecognitionPage />;
  if (page === "practice-vocab-review") return <VocabReviewPage />;
  if (page === "practice-listening") return <ListeningPage />;
  if (page === "practice-daily-challenge") return <DailyChallengePage />;
  if (page === "practice-weak-topics") return <WeakTopicsPage />;

  if (page === "dictionary") return <DictionaryPage />;
  if (page === "dictionary-all") return <AllWordsPage />;
  if (page === "dictionary-hsk1") return <Hsk1Page />;
  if (page === "dictionary-hsk2") return <Hsk2Page />;
  if (page === "dictionary-favorites") return <FavoritesPage />;

  if (page === "profile") return <ProfilePage />;
  if (page === "profile-overview") return <ProfileOverviewPage />;
  if (page === "profile-achievements") return <ProfileAchievementsPage />;
  if (page === "profile-preferences") return <ProfilePreferencesPage />;
  if (page === "profile-account") return <ProfileAccountPage />;

  if (page === "feature-detail") return <FeatureDetailPage />;
  const item = getCatalogItem(page as FeatureId);
  return <CatalogRedirect itemId={item?.id ?? null} />;
}

function CatalogRedirect({ itemId }: { itemId: FeatureId | null }) {
  const openFeature = useMadaraStore((s) => s.openFeature);
  useEffect(() => {
    if (itemId) openFeature(itemId);
  }, [itemId, openFeature]);
  if (itemId) return <FeatureDetailPage />;
  return <HomePage />;
}

export function AppShell() {
  const page = useMadaraStore((s) => s.page);
  const setPage = useMadaraStore((s) => s.setPage);
  const setAllFeaturesOpen = useMadaraStore((s) => s.setAllFeaturesOpen);
  const [moreOpen, setMoreOpen] = useState(false);
  const activeParent = getSidebarParent(page);
  const profileParent = SIDEBAR_NAV.find((n) => n.id === "profile");
  const moreActive = activeParent?.id === "profile";

  return (
    <div className="madara-theme min-h-[100dvh] bg-[var(--bg)]">
      <ThemeBinder />
      <SaveFeedbackBinder />
      <Toast />
      <AllFeaturesDrawer />
      <EnrollmentModal />

      <div className="lg:flex min-h-[100dvh]">
        <DesktopSidebar />

        <div className="flex-1 min-w-0 flex flex-col">
          <header
            className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--nav)] backdrop-blur"
            style={{ paddingTop: "var(--safe-area-inset-top)" }}
          >
            <div className="max-w-[1280px] mx-auto px-4 h-[64px] flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPage("home-overview")}
                className="flex items-center gap-2 min-h-[44px] lg:hidden"
              >
                <span className="hanzi text-[28px] font-black leading-none">
                  你
                </span>
                <span className="font-extrabold tracking-[0.22em] text-[15px] hidden sm:block">
                  Mandaozi
                </span>
              </button>
              <div className="hidden lg:block text-sm font-bold text-[var(--muted)]">
                Mandaozi
              </div>
              <div className="flex-1" />
              <SaveIndicator />
              <button
                type="button"
                onClick={() => setAllFeaturesOpen(true)}
                className="min-h-[40px] px-4 rounded-full border border-[var(--line)] bg-[var(--surface)] font-bold text-sm flex items-center gap-2"
              >
                <LayoutGrid size={16} />{" "}
                <span className="hidden sm:inline">All Features</span>
              </button>
            </div>
          </header>

          <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 py-5 pb-[96px] lg:pb-8">
            <PageRouter />
          </main>
        </div>
      </div>

      {moreOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-[45] bg-black/30"
            onClick={() => setMoreOpen(false)}
            aria-hidden
          />
          <div
            className="lg:hidden fixed left-3 right-3 z-[46] rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-xl"
            style={{ bottom: "calc(88px + var(--safe-area-inset-bottom))" }}
            role="dialog"
            aria-label="More menu"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="font-black">Menu</div>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="w-10 h-10 grid place-items-center rounded-full bg-[var(--bg)]"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-2">
              {profileParent?.children.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => {
                    setPage(child.id);
                    setMoreOpen(false);
                  }}
                  className={`min-h-[44px] px-4 rounded-xl text-left font-semibold ${
                    page === child.id
                      ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                      : "bg-[var(--bg)] text-[var(--ink)]"
                  }`}
                >
                  {child.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setAllFeaturesOpen(true);
                  setMoreOpen(false);
                }}
                className="min-h-[44px] px-4 rounded-xl text-left font-semibold bg-[var(--bg)] text-[var(--ink)]"
              >
                All Features
              </button>
            </div>
          </div>
        </>
      )}

      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--line)] bg-[var(--nav)] backdrop-blur"
        style={{ paddingBottom: "var(--safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-5 max-w-[720px] mx-auto">
          {MOBILE_NAV.map((n) => {
            const Icon = n.icon;
            const active = activeParent?.id === n.parent;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  setMoreOpen(false);
                  setPage(n.id);
                }}
                className="flex flex-col items-center justify-center min-h-[72px] gap-0.5"
              >
                <span
                  className="w-[48px] h-[28px] rounded-full grid place-items-center"
                  style={{
                    background: active ? "var(--primary-soft)" : "transparent",
                  }}
                >
                  <Icon
                    size={22}
                    color={active ? "var(--primary)" : "var(--muted)"}
                  />
                </span>
                <span
                  className="text-[11px] font-bold"
                  style={{ color: active ? "var(--primary)" : "var(--muted)" }}
                >
                  {n.label}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className="flex flex-col items-center justify-center min-h-[72px] gap-0.5"
            aria-expanded={moreOpen}
            aria-label="More menu"
          >
            <span
              className="w-[48px] h-[28px] rounded-full grid place-items-center"
              style={{
                background:
                  moreActive || moreOpen
                    ? "var(--primary-soft)"
                    : "transparent",
              }}
            >
              <MoreHorizontal
                size={22}
                color={
                  moreActive || moreOpen ? "var(--primary)" : "var(--muted)"
                }
              />
            </span>
            <span
              className="text-[11px] font-bold"
              style={{
                color:
                  moreActive || moreOpen ? "var(--primary)" : "var(--muted)",
              }}
            >
              More
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
