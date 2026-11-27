# Roadmap Silabus & Path Selected

## Status
- **Fase 1 (implemented)**: tipe data, placeholder UI/UX, state path terpilih, wiring World dasar.
- **Fase 2 (berikutnya)**: isi data silabus per roadmap, migrasi DB silabus, integrasi lesson↔node yang lebih dalam.

## Keputusan
| Poin | Keputusan |
|---|---|
| Nama fitur | **Roadmap** (sinonim: "perjalanan dao"); nama fitur tetap roadmap |
| Silabus | **Per roadmap** (`RoadmapDef.silabus`) dan ikut roadmap yang sedang dipilih |
| Interactive roadmap | Data ikut roadmap yang dipilih (sudah per-roadmap) |
| Section silabus | Heading **"Silabus"** di bawah **Interactive Roadmap** di `RoadmapsPage` |
| Fase awal | Placeholder UI/UX dulu; data silabus bisa diisi bertahap |
| Tombol pilih | "Jalani roadmap ini" / "Path aktif" / "Ganti path" — **satu** path aktif |
| World | Berkesinambungan dengan section **World** |
| Sidebar child world | Komponen lokal di `/world/[categoryId]` dengan judul persis **"Path Selected"** |
| Completed | Per user, di-derive dari `roadmapProgressById` (`getRoadmapCompletion(...).isCompleted`); roadmap completed tetap bisa dibuka/dipilih |
| Label akhir | "Perjalanan dao selesai — roadmap ini telah dikuasai."

## Data model

```ts
export interface RoadmapSilabusSection {
  id: string;
  title: string;
  items: string[];
}

export interface RoadmapSilabusDef {
  overview?: string;
  objectives: string[];
  sections: RoadmapSilabusSection[];
  materials?: string[];
  assessment?: string;
  estimatedDuration?: string;
}

export interface RoadmapDef {
  // ...existing
  silabus?: RoadmapSilabusDef;   // per roadmap
  worldCategoryId?: string;      // kesinambungan World (opsional)
}
```

## State
- `selectedPathRoadmapId: string | null` di `useMadaraStore` (persisted + synced).
- `setSelectedPathRoadmapId(roadmapId: string | null)` — memilih/mengganti/mengosongkan; **hanya satu**.
- `roadmapProgressById` tetap sumber kebenaran progress node per user; roadmap-level completed **di-derive**, tidak disimpan duplikat.
- `inProgressNodeId` (per roadmap) = node sedang dikerjakan; `selectedPathRoadmapId` = roadmap yang dijalani.

## UI
- `src/modules/roadmaps/components/roadmap-silabus.tsx` — section Silabus (placeholder/skeleton/empty state).
- `src/modules/roadmaps/components/roadmap-path-select-button.tsx` — tombol pilih/ganti path.
- `src/modules/world/components/path-selected-sidebar.tsx` — sidebar **"Path Selected"** di child world.

## DB (fase berikutnya)
- Tambah `silabus_json` (text JSON) ke tabel `roadmaps` **atau** tabel `roadmap_silabus` terpisah.
- Tambah `selected_path_roadmap_id` ke `user_profiles` (nullable, FK opsional ke `roadmaps`).
- Migration + seed + update `roadmaps.repo` mapper.

## Verifikasi
- Unit: roadmap-level completion derive, single-path set/switch.
- Typecheck/lint; responsive mobile; empty/skeleton; per-user sync.
