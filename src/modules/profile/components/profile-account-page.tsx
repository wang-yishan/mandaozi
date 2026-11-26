"use client";

import { ChevronRight, Lock, LogOut, RotateCcw, User, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageSubnav } from "@/components/layout/page-subnav";
import { Card } from "@/components/ui/card";
import { SaveIndicator } from "@/components/ui/save-indicator";
import { authClient } from "@/lib/auth-client";
import { useMadaraStore } from "@/store/madara-store";

export function ProfileAccountPage() {
  const s = useMadaraStore();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  async function handleSignOut() {
    await authClient.signOut();
    try {
      localStorage.removeItem("madara-modular-v1");
      localStorage.removeItem("mandaozi-phonics-v1");
    } catch {
      // ignore storage errors
    }
    router.push("/login");
    router.refresh();
  }

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
        <h2 className="text-lg font-black">Akun</h2>
        <div className="mt-3 rounded-2xl border border-[var(--line)] p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
              <User size={20} />
            </div>
            <div className="min-w-0">
              <div className="font-bold truncate">
                {session?.user?.name || "Pengguna"}
              </div>
              <div className="text-sm text-[var(--muted)] truncate">
                {session?.user?.phoneNumber || session?.user?.email || "—"}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 grid gap-2">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-between p-4 rounded-2xl border border-[var(--danger)]/20 bg-[var(--danger-bg)] text-left text-[var(--danger)]"
          >
            <span className="flex items-center gap-2 font-bold">
              <LogOut size={18} /> Keluar
            </span>
            <ChevronRight size={18} />
          </button>
        </div>
      </Card>

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
            onClick={() => router.push("/features/privacy")}
            className="w-full flex items-center justify-between p-4 rounded-2xl border border-[var(--line)] text-left"
          >
            <span className="flex items-center gap-2 font-bold">
              <Lock size={18} /> Privacy & Security
            </span>
            <ChevronRight size={18} className="text-[var(--muted)]" />
          </button>
          <button
            type="button"
            onClick={() => router.push("/features/subscription")}
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