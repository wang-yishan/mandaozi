"use client";

import { List, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CatalogSections } from "@/modules/catalog";
import { useMadaraStore } from "@/store/madara-store";

export default function FeaturesPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const layout = useMadaraStore((s) => s.moreMenuLayout);
  const setLayout = useMadaraStore((s) => s.setMoreMenuLayout);
  const intensiveEnrolled = useMadaraStore((s) => s.intensiveEnrolled);

  return (
    <section className="max-w-[980px] mx-auto space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--muted)]">Katalog</p>
          <h1 className="text-[28px] font-black leading-tight mt-1">
            All Features
          </h1>
          <p className="text-[var(--muted)]">
            Jelajahi semua fitur Mandaozi berdasarkan kategori.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 space-y-3">
        <label className="flex items-center gap-2 h-11 px-3 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
          <Search size={16} className="text-[var(--muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari fitur..."
            className="flex-1 bg-transparent outline-none text-sm"
            aria-label="Search features"
          />
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-[var(--muted)] mr-auto">
            Layout
          </span>
          {(
            [
              { id: "grid-2", label: "2 Col" },
              { id: "grid-3", label: "3 Col" },
              { id: "grid-4", label: "4 Col" },
              { id: "list", label: "List" },
            ] as const
          ).map((opt) => {
            const active = layout === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setLayout(opt.id)}
                className={`min-h-[36px] px-3 rounded-full text-xs font-bold border transition ${
                  active
                    ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                    : "bg-[var(--bg)] text-[var(--ink)] border-[var(--line)]"
                }`}
                aria-pressed={active}
                aria-label={`${opt.label} layout`}
              >
                {opt.id === "list" ? <List size={14} /> : opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <CatalogSections
        query={query}
        layout={layout}
        intensiveEnrolled={intensiveEnrolled}
        onItemSelect={(item) => router.push(`/features/${item.id}`)}
      />
    </section>
  );
}
