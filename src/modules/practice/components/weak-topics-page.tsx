"use client";

import { useRouter } from "next/navigation";
import { PageSubnav } from "@/components/layout/page-subnav";
import { Card } from "@/components/ui/card";
import { useMadaraStore } from "@/store/madara-store";

export function WeakTopicsContent() {
  const router = useRouter();
  const catId = useMadaraStore((s) => s.selectedWorldCategoryId);
  const items = [
    { name: "Numbers", pct: 42 },
    { name: "Tone 3", pct: 48 },
    { name: "Writing", pct: 41 },
  ];
  return (
    <Card className="p-5">
      <span className="text-xs font-black tracking-widest text-[var(--primary)]">
        WEAK TOPICS
      </span>
      <div className="grid gap-3 mt-4">
        {items.map((it) => (
          <div key={it.name} className="rounded-2xl bg-[var(--bg)] p-4">
            <div className="flex justify-between text-sm font-bold">
              <span>{it.name}</span>
              <span>{it.pct}%</span>
            </div>
            <div className="h-2.5 bg-[var(--line)] rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-[var(--vermillion)]"
                style={{ width: `${it.pct}%` }}
              />
            </div>
            <button
              type="button"
              onClick={() => router.push(`/world/${catId}/lesson`)}
              className="mt-2 text-sm font-bold text-[var(--primary)]"
            >
              Latihan {it.name} →
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function WeakTopicsPage() {
  return (
    <section className="max-w-[980px] mx-auto space-y-4">
      <div>
        <h1 className="text-[28px] font-black">Weak Topics</h1>
        <p className="text-[var(--muted)]">
          Fokus pada topik yang masih perlu diperkuat.
        </p>
      </div>
      <PageSubnav />
      <WeakTopicsContent />
    </section>
  );
}
