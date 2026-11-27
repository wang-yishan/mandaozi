import { BookOpenCheck, CheckCircle2, Clock3, ListChecks } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { RoadmapDef } from "../types/roadmap";

interface Props {
  roadmap: RoadmapDef;
}

function PlaceholderBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[var(--line)]/70 ${className}`}
      aria-hidden="true"
    />
  );
}

export function RoadmapSilabus({ roadmap }: Props) {
  const silabus = roadmap.silabus;

  return (
    <section aria-labelledby="roadmap-silabus-title" className="space-y-3">
      <div>
        <h2 id="roadmap-silabus-title" className="text-lg font-black">
          Silabus
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Ringkasan materi dan capaian untuk roadmap{" "}
          <span className="font-bold text-[var(--ink)]">{roadmap.title}</span>.
        </p>
      </div>

      {!silabus ? (
        <Card className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
              <BookOpenCheck size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-black text-[var(--ink)]">
                Silabus belum tersedia
              </div>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Silabus untuk roadmap ini sedang disiapkan. Section ini akan
                menampilkan tujuan belajar, materi, dan penilaian saat data
                silabus ditambahkan.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                <ListChecks size={14} /> Objectives
              </div>
              <div className="mt-3 space-y-2">
                <PlaceholderBlock className="h-3 w-full" />
                <PlaceholderBlock className="h-3 w-5/6" />
                <PlaceholderBlock className="h-3 w-4/6" />
              </div>
            </div>
            <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                <BookOpenCheck size={14} /> Materi
              </div>
              <div className="mt-3 space-y-2">
                <PlaceholderBlock className="h-3 w-full" />
                <PlaceholderBlock className="h-3 w-5/6" />
                <PlaceholderBlock className="h-3 w-3/4" />
              </div>
            </div>
            <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                <Clock3 size={14} /> Penilaian
              </div>
              <div className="mt-3 space-y-2">
                <PlaceholderBlock className="h-3 w-full" />
                <PlaceholderBlock className="h-3 w-4/6" />
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4 sm:p-5 space-y-4">
          {silabus.overview && (
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              {silabus.overview}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4">
              <div className="flex items-center gap-2 text-sm font-black">
                <ListChecks size={16} className="text-[var(--primary)]" />
                Tujuan belajar
              </div>
              {silabus.objectives.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {silabus.objectives.map((obj) => (
                    <li
                      key={obj}
                      className="flex items-start gap-2 text-sm text-[var(--ink)]"
                    >
                      <CheckCircle2
                        size={15}
                        className="mt-0.5 shrink-0 text-[var(--success,#16a34a)]"
                      />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-[var(--muted)]">
                  Belum ada tujuan.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4">
              <div className="flex items-center gap-2 text-sm font-black">
                <Clock3 size={16} className="text-[var(--primary)]" />
                Info silabus
              </div>
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                    Estimasi
                  </dt>
                  <dd className="font-bold text-[var(--ink)]">
                    {silabus.estimatedDuration ?? "Belum ditentukan"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                    Penilaian
                  </dt>
                  <dd className="text-[var(--ink)]">
                    {silabus.assessment ?? "Belum ditentukan"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-black">Materi / topik</div>
            {silabus.sections.length > 0 ? (
              <div className="grid gap-2">
                {silabus.sections.map((section, idx) => (
                  <div
                    key={section.id}
                    className="rounded-xl border border-[var(--line)] bg-[var(--bg)] p-4"
                  >
                    <div className="font-bold text-[var(--ink)]">
                      {idx + 1}. {section.title}
                    </div>
                    {section.items.length > 0 && (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">
                        {section.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)]">
                Belum ada materi silabus.
              </p>
            )}
          </div>

          {silabus.materials && silabus.materials.length > 0 && (
            <div>
              <div className="text-sm font-black">Bahan / referensi</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">
                {silabus.materials.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </section>
  );
}
