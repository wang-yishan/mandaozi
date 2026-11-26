"use client";

import { Lock } from "lucide-react";
import { useMemo } from "react";
import {
  CATALOG,
  CATALOG_GROUPS,
  type CatalogGroupId,
  type CatalogItem,
} from "@/modules/catalog/constants/catalog";
import type { MoreMenuLayout } from "@/store/madara-store";

interface CatalogSectionsProps {
  query: string;
  layout: MoreMenuLayout;
  onItemSelect: (item: CatalogItem) => void;
  intensiveEnrolled?: boolean;
}

export function CatalogSections({
  query,
  layout,
  onItemSelect,
  intensiveEnrolled = false,
}: CatalogSectionsProps) {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATALOG;
    return CATALOG.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q) ||
        CATALOG_GROUPS.find((g) => g.id === item.group)
          ?.label.toLowerCase()
          .includes(q),
    );
  }, [query]);

  const groups = useMemo(() => {
    const map = new Map<CatalogGroupId, CatalogItem[]>();
    for (const item of filtered) {
      const arr = map.get(item.group) ?? [];
      arr.push(item);
      map.set(item.group, arr);
    }
    return CATALOG_GROUPS.filter((g) => map.has(g.id)).map((g) => ({
      ...g,
      items: map.get(g.id) ?? [],
    }));
  }, [filtered]);

  const isList = layout === "list";
  const gridClass =
    layout === "grid-4"
      ? "grid-cols-4 gap-2"
      : layout === "grid-3"
        ? "grid-cols-3"
        : layout === "list"
          ? "grid-cols-1 gap-2"
          : "grid-cols-2";

  if (groups.length === 0) {
    return (
      <div className="text-sm text-[var(--muted)] py-10 text-center">
        Tidak ada fitur ditemukan.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.id}>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-xs font-black tracking-widest text-[var(--muted)] uppercase">
              {group.label}
            </h3>
            {group.premium && (
              <span className="text-[10px] font-black tracking-wide px-2 py-0.5 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] uppercase">
                Premium
              </span>
            )}
          </div>
          <div className={`grid gap-3 ${gridClass}`}>
            {group.items.map((item) => {
              const Icon = item.icon;
              const locked = item.intensive && !intensiveEnrolled;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onItemSelect(item)}
                  className={`rounded-2xl border text-left transition bg-[var(--bg)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--primary)] hover:bg-[var(--surface)] ${
                    isList
                      ? "min-h-[68px] px-4 py-3 flex items-center gap-3"
                      : "aspect-square p-3 sm:p-4 flex flex-col items-center justify-center gap-2 sm:gap-3 text-center"
                  }`}
                >
                  <span
                    className={`rounded-xl grid place-items-center shrink-0 relative ${
                      isList ? "w-11 h-11" : "w-11 h-11 sm:w-12 sm:h-12"
                    } bg-[var(--surface)] text-[var(--primary)]`}
                  >
                    <Icon size={isList ? 22 : 24} />
                    {locked && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--bg)] border border-[var(--line)] grid place-items-center text-[var(--muted)]">
                        <Lock size={10} />
                      </span>
                    )}
                  </span>
                  <span className={`min-w-0 ${isList ? "flex-1" : ""}`}>
                    <span
                      className={`block font-semibold leading-snug ${
                        isList ? "text-sm" : "text-xs sm:text-sm"
                      } ${isList ? "" : "line-clamp-2"}`}
                    >
                      {item.title}
                    </span>
                    {isList && (
                      <span className="block text-xs text-[var(--muted)] truncate mt-0.5">
                        {item.desc}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
