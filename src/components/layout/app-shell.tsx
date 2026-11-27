"use client";

import {
  BookOpen,
  Dumbbell,
  Globe,
  Home,
  LayoutGrid,
  List,
  MoreHorizontal,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SaveFeedbackBinder, ThemeBinder } from "@/components/layout/binders";
import { DesktopSidebar } from "@/components/layout/desktop-sidebar";
import { getSidebarParent } from "@/components/layout/sidebar-nav";
import { UserStateSync } from "@/components/shared/user-state-sync";
import { SaveIndicator } from "@/components/ui/save-indicator";
import { Toast } from "@/components/ui/toast";
import { CatalogSections } from "@/modules/catalog";
import { EnrollmentModal } from "@/modules/enrollment";
import { HomeRightSection } from "@/modules/home";
import { useMadaraStore } from "@/store/madara-store";

const MOBILE_NAV = [
  { href: "/home", label: "Home", icon: Home, parent: "home" },
  { href: "/world", label: "World", icon: Globe, parent: "world" },
  { href: "/practice", label: "Practice", icon: Dumbbell, parent: "practice" },
  {
    href: "/dictionary/all",
    label: "Dictionary",
    icon: BookOpen,
    parent: "dictionary",
  },
] as const;

function FontLoader() {
  useEffect(() => {
    const id = "app-noto-sans-sc";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&display=swap";
    document.head.appendChild(link);
  }, []);
  return null;
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const onboardingDone = useMadaraStore((s) => s.onboardingDone);
  const pathname = usePathname();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(() =>
    useMadaraStore.persist.hasHydrated(),
  );

  useEffect(() => {
    const unsubFinish = useMadaraStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    setHydrated(useMadaraStore.persist.hasHydrated());
    return () => {
      unsubFinish();
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const onOnboarding = pathname === "/onboarding";
    if (!onboardingDone && !onOnboarding) {
      router.replace("/onboarding");
    } else if (onboardingDone && onOnboarding) {
      router.replace("/home");
    }
  }, [hydrated, onboardingDone, pathname, router]);

  const onOnboarding = pathname === "/onboarding";
  if (!hydrated) return <div className="min-h-[100dvh] bg-[#FAF8F2]" />;
  if (!onboardingDone && !onOnboarding)
    return <div className="min-h-[100dvh] bg-[#FAF8F2]" />;
  if (onboardingDone && onOnboarding)
    return <div className="min-h-[100dvh] bg-[#FAF8F2]" />;
  return <>{children}</>;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const moreMenuLayout = useMadaraStore((s) => s.moreMenuLayout);
  const setMoreMenuLayout = useMadaraStore((s) => s.setMoreMenuLayout);
  const intensiveEnrolled = useMadaraStore((s) => s.intensiveEnrolled);
  const [moreOpen, setMoreOpen] = useState(false);
  const [moreQuery, setMoreQuery] = useState("");
  const activeParent = getSidebarParent(pathname);
  const moreActive =
    activeParent?.id === "profile" ||
    pathname === "/features" ||
    pathname.startsWith("/features/");
  const onOnboarding = pathname === "/onboarding";

  useEffect(() => {
    if (!moreOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [moreOpen]);

  useEffect(() => {
    if (pathname) setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) setMoreQuery("");
  }, [moreOpen]);

  return (
    <OnboardingGuard>
      <FontLoader />
      <UserStateSync />
      {onOnboarding ? (
        children
      ) : (
        <div className="app-theme min-h-[100dvh] bg-[var(--bg)]">
          <ThemeBinder />
          <SaveFeedbackBinder />
          <Toast />
          <EnrollmentModal />

          <div className="lg:flex min-h-[100dvh]">
            <DesktopSidebar />

            <div className="flex-1 min-w-0 flex flex-col">
              <header
                className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--nav)] backdrop-blur"
                style={{ paddingTop: "var(--safe-area-inset-top)" }}
              >
                <div className="max-w-[1280px] mx-auto px-4 h-[64px] flex items-center gap-3">
                  <Link
                    href="/home"
                    className="flex items-center gap-2 min-h-[44px] lg:hidden"
                  >
                    <span className="hanzi text-[28px] font-black leading-none">
                      你
                    </span>
                    <span className="font-extrabold tracking-[0.22em] text-[15px] hidden sm:block">
                      Mandaozi
                    </span>
                  </Link>
                  <div className="hidden lg:block text-sm font-bold text-[var(--muted)]">
                    Mandaozi
                  </div>
                  <div className="flex-1" />
                  <SaveIndicator />
                  <button
                    type="button"
                    onClick={() => router.push("/features")}
                    className="min-h-[40px] px-4 rounded-full border border-[var(--line)] bg-[var(--surface)] font-bold text-sm flex items-center gap-2"
                  >
                    <LayoutGrid size={16} />{" "}
                    <span className="hidden sm:inline">All Features</span>
                  </button>
                </div>
              </header>

              <main
                className={`flex-1 w-full mx-auto px-4 py-5 pb-[96px] lg:pb-8 ${
                  pathname === "/home" ? "max-w-[1440px]" : "max-w-[1280px]"
                }`}
              >
                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">{children}</div>
                  {pathname !== "/home" && (
                    <aside className="w-[320px] hidden xl:block">
                      <HomeRightSection />
                    </aside>
                  )}
                </div>
              </main>
            </div>
          </div>

          {moreOpen && (
            <div
              className="lg:hidden fixed inset-0 z-[46] bg-[var(--surface)] flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-label="More menu"
              style={{
                paddingTop: "var(--safe-area-inset-top)",
                paddingBottom: "var(--safe-area-inset-bottom)",
              }}
            >
              <div className="flex items-center justify-between px-4 h-[64px] border-b border-[var(--line)] shrink-0">
                <div>
                  <div className="font-black text-lg">All Features</div>
                  <div className="text-xs text-[var(--muted)]">
                    Jelajahi semua fitur
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMoreOpen(false)}
                  className="w-11 h-11 grid place-items-center rounded-full bg-[var(--bg)] text-[var(--ink)]"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-4 py-3 border-b border-[var(--line)] shrink-0 space-y-3">
                <label className="flex items-center gap-2 h-11 px-3 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
                  <Search size={16} className="text-[var(--muted)]" />
                  <input
                    value={moreQuery}
                    onChange={(e) => setMoreQuery(e.target.value)}
                    placeholder="Cari fitur..."
                    className="flex-1 bg-transparent outline-none text-sm"
                    aria-label="Search features"
                  />
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--muted)] mr-auto">
                    Layout
                  </span>
                  {(
                    [
                      { id: "grid-2", label: "2 Col" },
                      { id: "grid-3", label: "3 Col" },
                      { id: "grid-4", label: "4 Col" },
                      { id: "list", label: "List" },
                    ] as const
                  ).map((opt) => {
                    const activeLayout = moreMenuLayout === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setMoreMenuLayout(opt.id)}
                        className={`min-h-[36px] px-3 rounded-full text-xs font-bold border transition ${
                          activeLayout
                            ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                            : "bg-[var(--bg)] text-[var(--ink)] border-[var(--line)]"
                        }`}
                        aria-pressed={activeLayout}
                        aria-label={`${opt.label} layout`}
                      >
                        {opt.id === "list" ? <List size={14} /> : opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain p-4">
                <CatalogSections
                  query={moreQuery}
                  layout={moreMenuLayout}
                  intensiveEnrolled={intensiveEnrolled}
                  onItemSelect={(item) => {
                    setMoreOpen(false);
                    router.push(item.actionHref);
                  }}
                />
              </div>
            </div>
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
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setMoreOpen(false)}
                    className="flex flex-col items-center justify-center min-h-[72px] gap-0.5"
                  >
                    <span
                      className="w-[48px] h-[28px] rounded-full grid place-items-center"
                      style={{
                        background: active
                          ? "var(--primary-soft)"
                          : "transparent",
                      }}
                    >
                      <Icon
                        size={22}
                        color={active ? "var(--primary)" : "var(--muted)"}
                      />
                    </span>
                    <span
                      className="text-[11px] font-bold"
                      style={{
                        color: active ? "var(--primary)" : "var(--muted)",
                      }}
                    >
                      {n.label}
                    </span>
                  </Link>
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
                      moreActive || moreOpen
                        ? "var(--primary)"
                        : "var(--muted)",
                  }}
                >
                  More
                </span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </OnboardingGuard>
  );
}
