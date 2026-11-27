# Struktur Pembelajaran & Hierarki

Dokumen ini merangkum **struktur pembelajaran dan hierarki** yang dipakai di project Mandaozi. Fokusnya: bagaimana konten belajar disusun, bagaimana user menjalani pembelajaran, dan bagaimana progress/varian dicatat.

> Nama fitur tetap **roadmap**. **"Dao"** adalah label sidebar/halaman (`/world/dao`) untuk perjalanan belajar; "perjalanan dao" adalah sinonim roadmap. **"Varian Node"** adalah jenis pilihan pada node.

## 1. Hierarki besar (top-down)

```text
Platform
└── World (area pembelajaran)
    ├── World Explorer / Categories / Progress
    ├── Category (WorldCategory)                 # /world/[categoryId]
    │   ├── Lessons / items                      # WORLD_CATEGORIES[].lessons
    │   └── Path Selected sidebar                # roadmap aktif yang dipilih
    └── Dao (/world/dao)                         # tampilan simpel perjalanan aktif

Roadmap (fitur pembelajaran terstruktur)
└── RoadmapDef (per roadmap)
    ├── Silabus (RoadmapSilabusDef)              # per roadmap, section "Silabus"
    ├── Nodes (RoadmapNodeDef[])                 # node pembelajaran di diagram
    │   ├── Prerequisites                        # prerequisiteIds
    │   ├── Lesson Info                          # label/kind/href opsional
    │   └── Choices / Varian Node                # opsional; conditioning di Dao
    └── Edges (RoadmapEdgeDef[])                 # hubungan antar node; diagram tetap utuh

User Learning State (per user)
├── selectedPathRoadmapId                        # 1 roadmap aktif (Path Selected)
├── roadmapProgressById[roadmapId]
│   ├── completedNodeIds[]
│   └── inProgressNodeId
└── roadmapChoiceById[roadmapId][nodeId]         # pilihan Varian Node (Fase 1 local)
```

## 2. Entitas utama

### 2.1 World
- **Tujuan**: navigasi pembelajaran berbasis kategori dunia/topik.
- **Route utama**:
  - `/world` — World Explorer
  - `/world/categories` — Category Journey
  - `/world/progress` — Lesson Progress
  - `/world/[categoryId]` — detail kategori + **Path Selected** sidebar
  - `/world/dao` — **Dao** (perjalanan simpel, ter-track)
- **Data kategori**: `src/modules/world/constants/world.ts`
  - `WorldCategory { id, name, hanzi, pinyin, lessons, xp, desc }`
- **World ↔ Roadmap**: `RoadmapDef.worldCategoryId?` opsional; `RoadmapNodeLessonInfo.href` dapat mengarah ke `/world/...`.

### 2.2 Roadmap
- **Tujuan**: kurikulum/jalur belajar terstruktur per topik.
- **Route**: `/roadmaps` (Interactive Roadmap + Silabus + pilih path).
- **Tipe**: `src/modules/roadmaps/types/roadmap.ts`

```ts
RoadmapDef {
  id, title, description,
  nodes: RoadmapNodeDef[],
  edges: RoadmapEdgeDef[],
  silabus?: RoadmapSilabusDef,      // per roadmap
  worldCategoryId?: string
}
```

### 2.3 Silabus (per roadmap)
- **Lokasi UI**: section **"Silabus"** di bawah **Interactive Roadmap** pada `RoadmapsPage`.
- **Tipe**:
```ts
RoadmapSilabusDef {
  overview?: string;
  objectives: string[];
  sections: RoadmapSilabusSection[]; // {id,title,items[]}
  materials?: string[];
  assessment?: string;
  estimatedDuration?: string;
}
```
- **Status**: data silabus per roadmap bisa diisi bertahap; saat kosong UI menampilkan placeholder.

### 2.4 Node (unit pembelajaran di roadmap)
```ts
RoadmapNodeDef {
  id, title, description,
  category: "foundation" | "vocabulary" | "grammar" | "practice" | "assessment" | "milestone",
  estimatedDuration,
  prerequisiteIds: string[],
  lessonInfo?: { label, kind: "lesson"|"practice"|"assessment", href? },
  choices?: RoadmapNodeChoice[],    // Varian Node
  position: {x,y}
}
```
- **Prerequisite**: menentukan status `locked/available/recommended/in-progress/completed`.
- **Lesson link**: `lessonInfo.href` opsional; bisa dibuka dari roadmap/Dao.
- **Status node** (`RoadmapNodeStatus`): `completed | in-progress | available | locked | recommended`.

### 2.5 Edge
```ts
RoadmapEdgeDef { id, source, target, kind?: "main" | "branch" }
```
- Edge menggambarkan hubungan/arah di **diagram roadmap**. Diagram **tidak difilter** oleh Varian Node.

### 2.6 Varian Node (choice)
```ts
RoadmapNodeChoice {
  id, label, description?,
  variant?: { title?, description?, estimatedDuration?, lessonInfo? },
  includesNodeIds?: string[],   // DAO only
  excludesNodeIds?: string[],   // DAO only
  nextNodeIds?: string[]        // DAO only
}
```
- **Varian Node** = varian dari node itu sendiri.
- **Di roadmap**: semua node tetap tampil sesuai diagram; choice picker muncul di node/detail; pilihan disimpan.
- **Di Dao saja**: pilihan mengkondisikan arah pembelajaran. `buildDaoRoadmap(...)` memfilter node tertentu; `applyNodeVariant(...)` menerapkan varian tampilan. **Roadmap canvas tidak difilter.**

### 2.7 Dao
- **Route**: `/world/dao`, sidebar World item **"Dao"**.
- **Isi**: current roadmap terpilih + progress (`X/Y · %`) + **jejeran 1-per-1** node yang harus diselesaikan, ter-track, lebih simpel dari membuka roadmap.
- **Sumber state**: `selectedPathRoadmapId`, `roadmapProgressById`, `roadmapChoiceById`.
- **Conditioning**: hanya Dao memakai `buildDaoRoadmap`/`applyNodeVariant`; completion Dao dihitung pada jalur terpilih.

## 3. Hierarki progress & state

```text
User
├── selectedPathRoadmapId                # 1 path aktif
├── roadmapProgressById[roadmapId]
│   ├── completedNodeIds[]               # source of truth completion node
│   └── inProgressNodeId                 # node sedang dikerjakan
└── roadmapChoiceById[roadmapId]
    └── [nodeId] = choiceId              # Varian Node terpilih
```

### Aturan progress
- **Completed per user**: disimpan di `completedNodeIds` (progress node). Roadmap-level `isCompleted` **di-derive**: `getRoadmapCompletion(roadmap, progress).isCompleted` (`total>0 && completed===total`).
- **Tidak ada duplikasi state completed** roadmap level.
- **Satu path aktif**: `selectedPathRoadmapId` bisa diganti; progress node per roadmap tetap ada.
- **inProgressNodeId** ≠ `selectedPathRoadmapId`.
- **Varian Node** terpisah dari progress; reset choice = `null`.

## 4. Alur pembelajaran (user flow)

1. User buka **Roadmaps** (`/roadmaps`) → lihat Interactive Roadmap + **Silabus**.
2. User pilih **"Jalani roadmap ini"** → `selectedPathRoadmapId` diset (satu aktif).
3. Di roadmap, user bisa pilih **Varian Node** pada node (diagram tetap utuh).
4. User buka **World > Dao** (`/world/dao`) → melihat current roadmap, progress, dan **list 1-per-1** jalur terpilih; node tertentu bisa muncul/sembunyi sesuai Varian Node.
5. User buka node/lesson (`lessonInfo.href`) atau menandai in-progress; saat selesai, `completeRoadmapNode` mencatat completed.
6. Di **World child category** (`/world/[categoryId]`), sidebar **Path Selected** menampilkan roadmap aktif + ringkasan silabus/progress.
7. Jika semua node pada jalur yang dihitung selesai → **Completed** + "Perjalanan dao selesai — roadmap ini telah dikuasai." (roadmap tetap bisa dibuka/dipilih).

## 5. Peta relasi ringkas

| Dari | Ke | Relasi |
|---|---|---|
| World Category | Roadmap | `RoadmapDef.worldCategoryId?` / navigasi user |
| Roadmap | Silabus | `RoadmapDef.silabus?` (1 per roadmap) |
| Roadmap | Nodes/Edges | struktur kurikulum/diagram |
| Node | Prereq Node | `prerequisiteIds` |
| Node | Lesson/Practice/Assessment | `lessonInfo.href/kind/label` |
| Node | Varian Node choice | `choices[]` |
| User | Path aktif | `selectedPathRoadmapId` (1) |
| User | Node progress | `roadmapProgressById.completedNodeIds/inProgressNodeId` |
| User | Varian pilihan | `roadmapChoiceById` |
| Dao | Roadmap aktif | filter/varian hanya di Dao; roadmap diagram tetap utuh |

## 6. File kunci (implementasi)

- Types: `src/modules/roadmaps/types/roadmap.ts`
- Progress utils: `src/modules/roadmaps/utils/roadmap-progress.ts`
- Choice/Dao conditioning utils: `src/modules/roadmaps/utils/roadmap-choices.ts`
- Roadmap UI: `src/modules/roadmaps/components/roadmaps-page.tsx`, `roadmap-canvas.tsx`, `roadmap-node.tsx`, `roadmap-detail-panel.tsx`, `roadmap-node-choice-picker.tsx`, `roadmap-silabus.tsx`, `roadmap-path-select-button.tsx`
- Dao: `src/modules/world/components/dao-page.tsx`, route `src/app/(app)/world/dao/page.tsx`
- World: `src/modules/world/components/world-page.tsx`, `path-selected-sidebar.tsx`, `constants/world.ts`
- Store: `src/store/madara-store.ts`
- Sync/DB (Fase 2 choices): `src/components/shared/user-state-sync.tsx`, `src/db/repositories/user-state.repo.ts`, `src/db/schema/*`

## 7. Catatan Fase

- **Fase 1 (ada sekarang)**: Silabus per roadmap + Path Selected + Dao simpel + Varian Node/Dao-only conditioning local persisted.
- **Fase 2 (opsional)**: `roadmap_nodes.choices_json`, `user_roadmap_node_choices` + migration + sync per user; isi silabus DB; integrasi lesson↔node lebih dalam.
