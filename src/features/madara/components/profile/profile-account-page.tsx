"use client";

import { ChevronRight, Lock, RotateCcw, Wallet } from "lucide-react";
import { useMadaraStore } from "../../store/madara-store";
import { PageSubnav } from "../shell/page-subnav";
import { Card } from "../ui/card";
import { SaveIndicator } from "../ui/save-indicator";

export function ProfileAccountPage() {
  const s = useMadaraStore();
  return (
    <section className="max-w-[760px] mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-black">Account & Settings</h1>
          <p className="text-sm text-[var(--muted)]">
            Kelola akun, privasi, dan pengaturan aplikasi.
          </p>
        </div>
        <SaveIndicator />
      </div>
      <PageSubnav />

      <Card className="p-5">
        <h2 className="text-lg font-black">Akun & Lainnya</h2>
        <div className="mt-3 grid gap-2">
          <button
            type="button"
            onClick={() => {
              s.resetOnboarding();
              s.showToast("Onboarding direset");
            }}
            className="w-full flex items-center justify-between p-4 rounded-2xl border border-[var(--line)] text-left"
          >
            <span className="flex items-center gap-2 font-bold">
              <RotateCcw size={18} /> Review onboarding
            </span>
            <ChevronRight size={18} className="text-[var(--muted)]" />
          </button>
          <button
            type="button"
            onClick={() => s.openFeature("privacy")}
            className="w-full flex items-center justify-between p-4 rounded-2xl border border-[var(--line)] text-left"
          >
            <span className="flex items-center gap-2 font-bold">
              <Lock size={18} /> Privacy & Security
            </span>
            <ChevronRight size={18} className="text-[var(--muted)]" />
          </button>
          <button
            type="button"
            onClick={() => s.openFeature("subscription")}
            className="w-full flex items-center justify-between p-4 rounded-2xl border border-[var(--line)] text-left"
          >
            <span className="flex items-center gap-2 font-bold">
              <Wallet size={18} /> Subscription & Billing
            </span>
            <ChevronRight size={18} className="text-[var(--muted)]" />
          </button>
        </div>
      </Card>
    </section>
  );
}
