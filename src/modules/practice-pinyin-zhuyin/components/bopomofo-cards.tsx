"use client";

import { Volume2 } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { playPhonicsAudio } from "../lib/audio";
import { usePhonicsStore } from "../store";
import type { PhonicsSymbol } from "../types";

function groupLabel(group: string) {
  return group.replace("聲母 ", "").replace("介母 ", "").replace("韻母 ", "");
}

export function BopomofoCards({ symbols }: { symbols: PhonicsSymbol[] }) {
  const accent = usePhonicsStore((s) => s.selectedAccent);
  const rate = usePhonicsStore((s) => s.playbackRate);
  const [activeId, setActiveId] = useState<string | null>(null);

  const groups = Array.from(new Set(symbols.map((s) => s.group)));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black">Kartu Bopomofo per Karakter</h2>
        <p className="text-sm text-[var(--muted)] mt-1">
          Kenali setiap simbol Zhuyin satu per satu. Ketuk audio untuk mendengar
          bunyinya.
        </p>
      </div>

      {groups.map((group) => {
        const items = symbols.filter((s) => s.group === group);
        return (
          <div key={group}>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-black text-[var(--ink)]">
                {groupLabel(group)}
              </h3>
              <span className="text-[11px] font-bold text-[var(--muted)] bg-[var(--bg)] border border-[var(--line)] px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            </div>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((s) => {
                const ex = s.examples[0];
                const playing = activeId === s.id;
                return (
                  <Card key={s.id} className="p-4 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="hanzi text-5xl leading-none font-black text-[var(--ink)]">
                        {s.zhuyin ?? s.label}
                      </div>
                      <button
                        type="button"
                        aria-label={`Play ${s.label}`}
                        onClick={async () => {
                          setActiveId(s.id);
                          await playPhonicsAudio({
                            text: ex?.hanzi ?? s.label,
                            variant: accent,
                            rate,
                            audioSrc: ex?.audio?.[accent],
                          });
                          setActiveId(null);
                        }}
                        className={`w-9 h-9 rounded-full grid place-items-center shrink-0 border transition ${
                          playing
                            ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                            : "bg-[var(--surface)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--primary)] hover:border-[var(--primary)]"
                        }`}
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs font-black text-[var(--primary)] bg-[var(--primary-soft)] px-2 py-1 rounded-full">
                        {s.pinyin}
                      </span>
                      <span className="text-[11px] text-[var(--muted)] font-bold uppercase">
                        {s.kind}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--muted)] mt-2 leading-relaxed min-h-[32px]">
                      {s.descriptionId}
                    </p>

                    {ex && (
                      <div className="mt-3 pt-3 border-t border-[var(--line)]">
                        <div className="hanzi text-lg font-black">
                          {ex.hanzi}
                        </div>
                        <div className="text-xs text-[var(--muted)] font-semibold">
                          {ex.pinyin} · {ex.zhuyin}
                        </div>
                        <div className="text-[11px] text-[var(--muted)]">
                          {ex.glossId}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
