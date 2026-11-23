"use client";

import { ArrowLeft, Lock } from "lucide-react";
import { CATALOG_GROUPS, getCatalogItem } from "../../data/catalog";
import { getP3Placeholder } from "../../data/p3";
import { useMadaraStore } from "../../store/madara-store";
import { IntensiveGateCard } from "../enrollment/intensive-gate";
import { Card } from "../ui/card";

export function FeatureDetailPage() {
  const selectedId = useMadaraStore((s) => s.selectedFeatureId);
  const selectedP3Id = useMadaraStore((s) => s.selectedP3Id);
  const setPage = useMadaraStore((s) => s.setPage);
  const closeFeature = useMadaraStore((s) => s.closeFeature);
  const enrolled = useMadaraStore((s) => s.intensiveEnrolled);
  const showToast = useMadaraStore((s) => s.showToast);

  const p3 = selectedP3Id ? getP3Placeholder(selectedP3Id) : undefined;
  if (p3) {
    const P3Icon = p3.icon;
    return (
      <section className="max-w-[760px] mx-auto">
        <button
          type="button"
          onClick={closeFeature}
          className="flex items-center gap-1 font-bold min-h-[44px] text-[var(--ink)]"
        >
          <ArrowLeft size={18} /> Kembali
        </button>
        <p className="text-xs font-black tracking-widest text-[var(--muted)] uppercase mt-1">
          P3 • Coming Soon{" "}
          <span className="text-[var(--primary)]">/ {p3.source}</span>
        </p>
        <div className="flex gap-4 items-start mt-3">
          <div className="w-[68px] h-[68px] rounded-2xl grid place-items-center shrink-0 bg-[var(--primary-soft)] text-[var(--primary)]">
            <P3Icon size={30} />
          </div>
          <div className="min-w-0">
            <h1 className="text-[28px] font-black leading-tight">{p3.title}</h1>
            <p className="text-[var(--muted)] mt-1">{p3.desc}</p>
            <span className="inline-block mt-2 text-xs font-bold px-2 py-1 rounded-full bg-[var(--bg)] border border-[var(--line)]">
              P3 Placeholder
            </span>
          </div>
        </div>
        <Card className="p-5 mt-4">
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            Placeholder ini sengaja disiapkan di sidebar desktop untuk P3.
            Implementasi fitur akan dikerjakan pada tahap berikutnya.
          </p>
        </Card>
      </section>
    );
  }

  const item = selectedId ? getCatalogItem(selectedId) : undefined;
  if (!item) {
    return (
      <div className="p-6">
        <button
          type="button"
          onClick={closeFeature}
          className="font-bold text-[var(--primary)]"
        >
          ← Kembali
        </button>
        <p className="mt-4 text-[var(--muted)]">Fitur tidak ditemukan.</p>
      </div>
    );
  }

  const group = CATALOG_GROUPS.find((g) => g.id === item.group);
  const Icon = item.icon;
  const gated = !!item.intensive && !enrolled;
  const isMyIntensive = item.id === "intensive-class";

  const handleCta = () => {
    if (gated && !isMyIntensive) {
      // Stay on detail, gate is visible.
      showToast("Fitur ini membutuhkan pendaftaran Intensive Program.");
      return;
    }
    if (item.actionPage === "feature-detail") return;
    setPage(item.actionPage);
  };

  return (
    <section className="max-w-[760px] mx-auto">
      <button
        type="button"
        onClick={closeFeature}
        className="flex items-center gap-1 font-bold min-h-[44px] text-[var(--ink)]"
      >
        <ArrowLeft size={18} /> Kembali
      </button>
      <p className="text-xs font-black tracking-widest text-[var(--muted)] uppercase mt-1">
        {group?.label}{" "}
        <span className="text-[var(--primary)]">/ {item.title}</span>
      </p>

      <div className="flex gap-4 items-start mt-3">
        <div className="w-[68px] h-[68px] rounded-2xl grid place-items-center shrink-0 bg-[var(--primary-soft)] text-[var(--primary)]">
          {gated ? <Lock size={30} /> : <Icon size={30} />}
        </div>
        <div className="min-w-0">
          <h1 className="text-[28px] font-black leading-tight">{item.title}</h1>
          <p className="text-[var(--muted)] mt-1">{item.desc}</p>
          <span className="inline-block mt-2 text-xs font-bold px-2 py-1 rounded-full bg-[var(--bg)] border border-[var(--line)]">
            {gated ? "Enrollment Required" : "Coming Soon"}
          </span>
        </div>
      </div>

      {isMyIntensive && <IntensiveGateCard />}
      {gated && !isMyIntensive && (
        <Card className="p-5 mt-4">
          <p className="text-xs font-black tracking-widest text-[var(--primary)]">
            ENROLLMENT REQUIRED
          </p>
          <h2 className="text-lg font-black mt-1">Akses terkunci</h2>
          <p className="text-sm text-[var(--muted)] mt-1">
            Join the Intensive Program to access this feature. Status
            pendaftaranmu saat ini tidak aktif.
          </p>
          <button
            type="button"
            onClick={() => setPage("feature-detail")}
            className="hidden"
            aria-hidden
          />
          <div className="mt-4 flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                useMadaraStore.getState().openFeature("intensive-class");
              }}
              className="min-h-[44px] px-4 rounded-full bg-[var(--primary)] text-white font-bold text-sm"
            >
              Buka My Intensive Class
            </button>
          </div>
        </Card>
      )}

      {!gated && !isMyIntensive && (
        <Card className="p-5 mt-4">
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            Fitur ini sedang disiapkan. Kamu bisa lanjut belajar dari halaman
            yang sudah aktif sambil menunggu fitur ini tersedia.
          </p>
          <button
            type="button"
            onClick={handleCta}
            className="mt-4 min-h-[48px] px-5 rounded-full bg-[var(--primary)] text-white font-bold text-sm"
          >
            {item.action} →
          </button>
        </Card>
      )}

      {isMyIntensive && (
        <p className="text-center text-xs text-[var(--muted)] mt-3">
          Enrollment is handled outside this demo. No checkout is created here.
        </p>
      )}
    </section>
  );
}
