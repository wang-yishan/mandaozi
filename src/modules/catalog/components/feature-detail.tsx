"use client";

import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { getCatalogItem } from "@/modules/catalog/constants/catalog";
import { getP3Placeholder } from "@/modules/catalog/constants/p3";
import { useMadaraStore } from "@/store/madara-store";

export function FeatureDetailView({ featureId }: { featureId: string }) {
  const router = useRouter();
  const intensiveEnrolled = useMadaraStore((s) => s.intensiveEnrolled);
  const setEnrollmentModalOpen = useMadaraStore(
    (s) => s.setEnrollmentModalOpen,
  );

  const p3 = getP3Placeholder(featureId);
  if (p3) {
    const Icon = p3.icon;
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 min-h-[44px] px-1 text-sm font-bold text-[var(--muted)] hover:text-[var(--ink)]"
        >
          <ArrowLeft size={16} /> Kembali
        </button>
        <Card className="p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="w-14 h-14 rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)] grid place-items-center shrink-0">
              <Icon size={28} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black tracking-widest text-[var(--muted)] uppercase mb-1">
                {p3.source} • Coming Soon
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">{p3.title}</h1>
              <p className="mt-2 text-[var(--muted)]">{p3.desc}</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const item = getCatalogItem(featureId as never);
  if (!item) return null;

  const Icon = item.icon;
  const locked = item.intensive && !intensiveEnrolled;

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 min-h-[44px] px-1 text-sm font-bold text-[var(--muted)] hover:text-[var(--ink)]"
      >
        <ArrowLeft size={16} /> Kembali
      </button>

      <Card className="p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="w-14 h-14 rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)] grid place-items-center shrink-0">
            <Icon size={28} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-black tracking-widest text-[var(--muted)] uppercase mb-1">
              {item.group}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">{item.title}</h1>
            <p className="mt-2 text-[var(--muted)]">{item.desc}</p>

            <div className="mt-5 flex flex-wrap gap-3">
              {locked ? (
                <button
                  type="button"
                  onClick={() => setEnrollmentModalOpen(true)}
                  className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-full bg-[var(--primary)] text-white font-bold"
                >
                  <Lock size={16} /> Buka Akses Intensif
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push(item.actionHref)}
                  className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-full bg-[var(--primary)] text-white font-bold"
                >
                  {item.action} <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
