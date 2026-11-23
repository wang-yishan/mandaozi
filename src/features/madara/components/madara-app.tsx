"use client";

import { useEffect } from "react";
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
      {!onboardingDone ? <OnboardingFlow /> : <AppShell />}
    </>
  );
}
