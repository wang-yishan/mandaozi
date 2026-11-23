"use client";

import { Dumbbell, Search, Star, Volume2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { VOCAB } from "../../data/vocab";
import { useMadaraStore } from "../../store/madara-store";
import { PageSubnav } from "../shell/page-subnav";
import { Card } from "../ui/card";
import { Chip } from "../ui/chip";

function toneNumber(pinyin: string): number {
  const map: Record<string, number> = {
    ā: 1,
    á: 2,
    ǎ: 3,
    à: 4,
    ē: 1,
    é: 2,
    ě: 3,
    è: 4,
    ī: 1,
    í: 2,
    ǐ: 3,
    ì: 4,
    ō: 1,
    ó: 2,
    ǒ: 3,
    ò: 4,
    ū: 1,
    ú: 2,
    ǔ: 3,
    ù: 4,
    ǖ: 1,
    ǘ: 2,
    ǚ: 3,
    ǜ: 4,
  };
  for (const ch of pinyin.normalize("NFD")) {
    const n = map[ch];
    if (n) return n;
  }
  for (const ch of pinyin) {
    const n = map[ch];
    if (n) return n;
  }
  return 5;
}

const STROKE_HINTS: Record<string, string> = {
  你: "撇、竖、撇、点、竖钩、撇、点 — kiri dulu, lalu kanan.",
  好: "女 + 子 — tulis komponen kiri dulu, lalu kanan.",
  谢: "讠 + 射 — mulai dari komponen bicara di kiri.",
  我: "撇、横、竖钩、提、斜钩、撇、点.",
  大: "横、撇、捺 — dari atas ke bawah, melebar.",
};
const defaultStroke =
  "Tulis dari atas ke bawah, kiri ke kanan. Perlambat di setiap goresan.";

export type DictionaryFilter = "All" | "HSK1" | "HSK2" | "Favorites";

export function DictionaryView({
  initialFilter,
  title,
  subtitle,
}: {
  initialFilter: DictionaryFilter;
  title: string;
  subtitle: string;
}) {
  const q = useMadaraStore((s) => s.dictionaryQuery);
  const filter = useMadaraStore((s) => s.dictionaryFilter);
  const setQ = useMadaraStore((s) => s.setDictionaryQuery);
  const setFilter = useMadaraStore((s) => s.setDictionaryFilter);
  const favorites = useMadaraStore((s) => s.favorites);
  const toggleFav = useMadaraStore((s) => s.toggleFavorite);
  const sound = useMadaraStore((s) => s.sound);
  const showToast = useMadaraStore((s) => s.showToast);
  const setPage = useMadaraStore((s) => s.setPage);
  const setPracticeTab = useMadaraStore((s) => s.setPracticeTab);
  const [selected, setSelected] = useState<(typeof VOCAB)[number] | null>(null);

  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter, setFilter]);

  const list = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return VOCAB.filter((w) => {
      const matchQ =
        !qq ||
        w.hanzi.includes(qq) ||
        w.pinyin.toLowerCase().includes(qq) ||
        w.en.toLowerCase().includes(qq) ||
        w.id.toLowerCase().includes(qq);
      const matchF =
        filter === "All"
          ? true
          : filter === "Favorites"
            ? favorites.includes(w.hanzi)
            : w.hsk === filter;
      return matchQ && matchF;
    });
  }, [q, filter, favorites]);

  const play = (text: string) => {
    if (!sound) {
      showToast("Sound mati — aktifkan di Profil.");
      return;
    }
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "zh-CN";
      u.rate = 0.82;
      window.speechSynthesis?.cancel();
      window.speechSynthesis?.speak(u);
    } catch {
      showToast(`Audio preview: ${text}`);
    }
  };

  return (
    <section className="max-w-[980px] mx-auto space-y-4">
      <div>
        <h1 className="text-[28px] font-black">{title}</h1>
        <p className="text-[var(--muted)]">{subtitle}</p>
      </div>
      <PageSubnav />

      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          size={18}
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari Hanzi, Pinyin, English, Indonesia…"
          aria-label="Cari kamus"
          className="w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] pl-11 pr-4 py-3.5 min-h-[48px]"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {(["All", "HSK1", "HSK2", "Favorites"] as const).map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f === "Favorites" ? `Favorites (${favorites.length})` : f}
          </Chip>
        ))}
      </div>

      <p className="text-xs text-[var(--muted)]">
        {list.length} kata ditemukan · Ketuk kata untuk detail.
      </p>

      {list.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-4xl">🔍</div>
          <h2 className="font-black text-lg mt-2">Tidak ada hasil</h2>
          <p className="text-sm text-[var(--muted)] mt-1">
            Coba kata lain, atau ubah filter ke All.
          </p>
          <button
            type="button"
            onClick={() => {
              setQ("");
              setFilter("All");
            }}
            className="mt-4 min-h-[44px] px-4 rounded-full border border-[var(--line)] font-bold"
          >
            Reset
          </button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {list.map((w) => {
            const fav = favorites.includes(w.hanzi);
            return (
              <div
                key={w.hanzi}
                className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-4 text-left hover:bg-[var(--bg)]"
              >
                <div className="flex justify-between items-start gap-2">
                  <button
                    type="button"
                    onClick={() => setSelected(w)}
                    className="text-left min-w-0 flex-1"
                  >
                    <span className="hanzi text-[32px] font-bold leading-none block">
                      {w.hanzi}
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Favorit ${w.hanzi}`}
                    onClick={() => {
                      toggleFav(w.hanzi);
                      showToast(
                        fav ? "Dihapus dari favorit" : "Disimpan ke favorit ★",
                      );
                    }}
                    className="min-h-[36px] min-w-[36px] grid place-items-center shrink-0"
                  >
                    <Star
                      size={20}
                      fill={fav ? "var(--primary)" : "none"}
                      color={fav ? "var(--primary)" : "var(--muted)"}
                    />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(w)}
                  className="block w-full text-left"
                >
                  <p className="font-bold text-sm mt-2">{w.pinyin}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {w.id} · {w.en}
                  </p>
                  <span className="inline-block mt-2 text-[11px] font-bold px-2 py-1 rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
                    {w.hsk}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <>
          {/* biome-ignore lint/a11y/useSemanticElements: backdrop overlay */}
          <div
            className="fixed inset-0 z-[80] bg-black/45 grid items-end sm:items-center justify-items-center p-0 sm:p-4"
            role="button"
            tabIndex={0}
            aria-label="Tutup detail"
            onClick={() => setSelected(null)}
            onKeyDown={(e) => {
              if (e.key === "Escape" || e.key === "Enter") setSelected(null);
            }}
          >
            <div
              className="bg-[var(--surface)] w-full max-w-[560px] max-h-[92vh] overflow-y-auto rounded-t-[28px] sm:rounded-[28px] p-6"
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
                  {selected.hsk} · Vocabulary
                </span>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="w-10 h-10 rounded-full bg-[var(--bg)] grid place-items-center"
                  aria-label="Tutup"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="text-center mt-2">
                <div className="hanzi text-[72px] leading-none font-black">
                  {selected.hanzi}
                </div>
                <div className="text-xl font-black mt-2">
                  {selected.pinyin} · Tone {toneNumber(selected.pinyin)}
                </div>
                <p className="text-[var(--muted)] mt-1">
                  {selected.en} · {selected.id}
                </p>
                <div className="flex justify-center gap-1 mt-3">
                  {[1, 2, 3, 4].map((n) => (
                    <span
                      key={n}
                      className="text-xs font-black px-2 py-1 rounded-full"
                      style={{
                        background:
                          n === toneNumber(selected.pinyin)
                            ? "var(--primary)"
                            : "var(--line)",
                        color:
                          n === toneNumber(selected.pinyin)
                            ? "white"
                            : "var(--muted)",
                      }}
                    >
                      Tone {n}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-[var(--bg)] rounded-2xl p-4 mt-4">
                <b>Stroke order hint</b>
                <p className="text-sm text-[var(--muted)] mt-1">
                  {STROKE_HINTS[selected.hanzi] || defaultStroke}
                </p>
              </div>
              <div className="bg-[var(--bg)] rounded-2xl p-4 mt-2">
                <b>Contoh</b>
                <p className="hanzi text-xl mt-1">{selected.ex}</p>
                <p className="text-sm text-[var(--muted)] mt-1">
                  {selected.exId}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    toggleFav(selected.hanzi);
                    showToast(
                      favorites.includes(selected.hanzi)
                        ? "Dihapus dari favorit"
                        : "Disimpan ★",
                    );
                  }}
                  className="min-h-[48px] rounded-full border border-[var(--line)] font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Star
                    size={18}
                    fill={
                      favorites.includes(selected.hanzi)
                        ? "var(--primary)"
                        : "none"
                    }
                  />{" "}
                  {favorites.includes(selected.hanzi) ? "Tersimpan" : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(null);
                    setPracticeTab("Flashcards");
                    setPage("practice-flashcards");
                  }}
                  className="min-h-[48px] rounded-full bg-[var(--primary)] text-white font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Dumbbell size={18} /> Latihan kata →
                </button>
              </div>
              <button
                type="button"
                onClick={() => play(selected.hanzi)}
                className="w-full mt-2 min-h-[44px] rounded-full border border-[var(--line)] font-bold text-sm flex items-center justify-center gap-2"
              >
                <Volume2 size={18} /> Putar pelafalan
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
