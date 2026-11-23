"use client";

import { ChevronDown, Lock, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { CATALOG_GROUPS, getCatalogByGroup } from "../../data/catalog";
import { useMadaraStore } from "../../store/madara-store";

export function AllFeaturesDrawer() {
  const open = useMadaraStore((s) => s.allFeaturesOpen);
  const query = useMadaraStore((s) => s.allFeaturesQuery);
  const setOpen = useMadaraStore((s) => s.setAllFeaturesOpen);
  const setQuery = useMadaraStore((s) => s.setAllFeaturesQuery);
  const openFeature = useMadaraStore((s) => s.openFeature);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATALOG_GROUPS.map((g) => {
      const items = getCatalogByGroup(g.id).filter(
        (it) =>
          !q ||
          it.title.toLowerCase().includes(q) ||
          it.desc.toLowerCase().includes(q),
      );
      return { ...g, items };
    }).filter((g) => g.items.length > 0);
  }, [query]);

  if (!open) return null;

  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div
      className="fixed inset-0 z-[70] bg-[var(--bg)] flex flex-col"
      style={{ paddingTop: "var(--safe-area-inset-top)" }}
      role="dialog"
      aria-label="All Features"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line)] bg-[var(--surface)] shrink-0">
        <div>
          <h2 className="text-[20px] font-black">Semua Fitur</h2>
          <p className="text-xs text-[var(--muted)]">
            {total} fitur · ketuk untuk membuka detail
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Tutup Semua Fitur"
          className="w-11 h-11 grid place-items-center rounded-full bg-[var(--bg)] border border-[var(--line)]"
        >
          <X size={20} />
        </button>
      </div>

      <div className="px-4 pt-3 shrink-0">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            size={18}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari fitur, contoh: Flashcards"
            aria-label="Cari fitur"
            className="w-full bg-[var(--surface)] border border-[var(--line)] rounded-2xl pl-11 pr-4 py-3 text-[15px] min-h-[48px]"
          />
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 pb-6 pt-3"
        style={{ paddingBottom: "calc(24px + var(--safe-area-inset-bottom))" }}
      >
        {groups.map((g) => {
          const isCollapsed = !!collapsed[g.id];
          return (
            <div
              key={g.id}
              className={
                g.premium
                  ? "rounded-2xl p-2 mt-3 bg-[#FDECEC] border border-[#F3C2C2]"
                  : "mt-3"
              }
            >
              <button
                type="button"
                onClick={() =>
                  setCollapsed((c) => ({ ...c, [g.id]: !c[g.id] }))
                }
                aria-expanded={!isCollapsed}
                className="w-full flex items-center justify-between min-h-[44px] px-1 text-left"
              >
                <span className="flex items-center gap-2">
                  <span className="text-[11px] font-black tracking-[0.14em] text-[var(--muted)] uppercase">
                    {g.label}
                  </span>
                  {g.premium && (
                    <span className="flex items-center gap-1 text-[10px] font-black bg-[var(--primary)] text-white px-2 py-0.5 rounded-full">
                      <Lock size={10} /> PREMIUM
                    </span>
                  )}
                </span>
                <ChevronDown
                  size={16}
                  className="text-[var(--muted)] transition"
                  style={{ transform: isCollapsed ? "rotate(-90deg)" : "none" }}
                />
              </button>

              {!isCollapsed && (
                <div className="grid gap-2 mt-1">
                  {g.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => openFeature(item.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[var(--surface)] border border-[var(--line)] text-left min-h-[64px] hover:bg-[var(--bg)]"
                      >
                        <span className="w-11 h-11 rounded-xl grid place-items-center shrink-0 bg-[var(--primary-soft)] text-[var(--primary)]">
                          <Icon size={20} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-bold text-[14px] leading-tight">
                            {item.title}
                          </span>
                          <span className="block text-[12px] text-[var(--muted)] mt-0.5 leading-snug">
                            {item.desc}
                          </span>
                        </span>
                        {item.intensive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] shrink-0">
                            PREMIUM
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        {groups.length === 0 && (
          <div className="text-center py-12 text-[var(--muted)]">
            <p className="font-bold">Tidak ada fitur ditemukan</p>
            <p className="text-sm mt-1">Coba kata kunci lain.</p>
          </div>
        )}
      </div>
    </div>
  );
}
