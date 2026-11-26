"use client";

import { ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageSubnav } from "@/components/layout/page-subnav";
import { Card } from "@/components/ui/card";
import type { WorldCategory } from "@/modules/world/constants/world";
import { useMadaraStore } from "@/store/madara-store";

export function WorldProgressPage({
  categories,
}: {
  categories: WorldCategory[];
}) {
  const completedLessons = useMadaraStore((s) => s.completedLessons);
  const selectCategory = useMadaraStore((s) => s.selectWorldCategory);
  const router = useRouter();
  const catId = useMadaraStore((s) => s.selectedWorldCategoryId);

  const totalLessons = categories.reduce(
    (n, c) => n + c.lessons.length,
    0,
  );
  const completedCount = categories.reduce(
    (n, c) => n + c.lessons.filter((l) => completedLessons.includes(l)).length,
    0,
  );

  return (
    <section className="max-w-[980px] mx-auto space-y-4">
      <div>
        <h1 className="text-[28px] font-black">Lesson Progress</h1>
        <p className="text-[var(--muted)]">
          Lihat progres perjalanan belajarmu di World 1.
        </p>
      </div>
      <PageSubnav />

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black tracking-widest text-[var(--muted)] uppercase">
              World 1 · Beginner
            </p>
            <h2 className="text-xl font-black mt-1">
              {completedCount}/{totalLessons} lessons completed
            </h2>
          </div>
          <div className="text-2xl font-black text-[var(--primary)]">
            {totalLessons
              ? Math.round((completedCount / totalLessons) * 100)
              : 0}
            %
          </div>
        </div>
        <div className="h-3 bg-[var(--line)] rounded-full mt-4 overflow-hidden">
          <div
            className="h-full bg-[var(--primary)]"
            style={{
              width: `${totalLessons ? (completedCount / totalLessons) * 100 : 0}%`,
            }}
          />
        </div>
      </Card>

      <div className="grid gap-3">
        {categories.map((cat, idx) => {
          const done = cat.lessons.filter((l) =>
            completedLessons.includes(l),
          ).length;
          const locked = idx > 1;
          return (
            <Card key={cat.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="hanzi text-2xl text-[var(--primary)]">
                      {cat.hanzi}
                    </span>
                    <h3 className="font-black text-lg">{cat.name}</h3>
                    {locked && (
                      <Lock size={16} className="text-[var(--muted)]" />
                    )}
                  </div>
                  <p className="text-sm text-[var(--muted)] mt-1">{cat.desc}</p>
                </div>
                <div className="text-sm font-bold shrink-0">
                  {done}/{cat.lessons.length}
                </div>
              </div>
              <div className="h-2 bg-[var(--line)] rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-[var(--primary)]"
                  style={{ width: `${(done / cat.lessons.length) * 100}%` }}
                />
              </div>
              <div className="mt-3 grid gap-2">
                {cat.lessons.map((lesson) => {
                  const isDone = completedLessons.includes(lesson);
                  return (
                    <div
                      key={lesson}
                      className="flex items-center justify-between text-sm bg-[var(--bg)] rounded-xl px-3 py-2"
                    >
                      <span className="font-medium">{lesson}</span>
                      {isDone ? (
                        <span className="inline-flex items-center gap-1 text-[#1D7A52] font-bold">
                          <CheckCircle2 size={14} /> Selesai
                        </span>
                      ) : (
                        <span className="text-[var(--muted)]">Belum</span>
                      )}
                    </div>
                  );
                })}
              </div>
              {!locked && (
                <button
                  type="button"
                  onClick={() => {
                    selectCategory(cat.id);
                    router.push(`/world/${cat.id}`);
                  }}
                  className="mt-4 min-h-[44px] px-4 rounded-full border border-[var(--line)] font-bold text-sm inline-flex items-center gap-2"
                >
                  Buka Category <ArrowRight size={16} />
                </button>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="p-4 flex items-center justify-between gap-3">
        <div>
          <b>Lanjutkan pelajaran aktif</b>
          <p className="text-sm text-[var(--muted)]">
            Masuk ke alur lesson saat ini.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/world/${catId}/lesson`)}
          className="min-h-[44px] px-4 rounded-full bg-[var(--primary)] text-white font-bold text-sm"
        >
          Buka Lesson
        </button>
      </Card>
    </section>
  );
}
