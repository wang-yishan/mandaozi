"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { isValidPageId, MADARA_PAGE_PARAM } from "../lib/madara-navigation";
import { useMadaraStore } from "../store/madara-store";
import { OnboardingFlow } from "./onboarding/onboarding-flow";
import { AppShell } from "./shell/app-shell";

function FontLoader() {
  useEffect(() => {
    const id = "madara-noto-sans-sc";
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

function UrlPageSync() {
  const searchParams = useSearchParams();
  const page = useMadaraStore((s) => s.page);
  const setPage = useMadaraStore((s) => s.setPage);
  const onboardingDone = useMadaraStore((s) => s.onboardingDone);
  const pageParam = searchParams.get(MADARA_PAGE_PARAM);

  useEffect(() => {
    if (!onboardingDone) return;
    if (isValidPageId(pageParam) && pageParam !== page) {
      setPage(pageParam);
    }
  }, [onboardingDone, page, pageParam, setPage]);

  return null;
}

export function MadaraApp() {
  const onboardingDone = useMadaraStore((s) => s.onboardingDone);
  const page = useMadaraStore((s) => s.page);

  useEffect(() => {
    // If user resets onboarding, ensure they land on onboarding.
    if (!onboardingDone && page !== "onboarding") {
      useMadaraStore.getState().setPage("onboarding");
    }
  }, [onboardingDone, page]);

  return (
    <>
      <FontLoader />
      <UrlPageSync />
      {!onboardingDone ? <OnboardingFlow /> : <AppShell />}
    </>
  );
}
