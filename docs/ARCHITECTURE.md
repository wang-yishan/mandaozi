# Architecture

## Overview
Mandaozi is a web-first Next.js (App Router) application with a modular structure. Business logic is kept separate from UI where practical; DB access lives in `src/db/repositories`.

## Modules (`src/modules`)
- **roadmaps** — roadmap/perjalanan dao: interactive node graph, progress, silabus per roadmap, path selection. Key files: `components/roadmaps-page.tsx`, `types/roadmap.ts`, `utils/roadmap-progress.ts`, `hooks/use-roadmap-progress.ts`.
- **world** — world/category/lesson experience. Child world (`/world/[categoryId]`) shows `PathSelectedSidebar` for the selected roadmap path.
- **practice**, **dictionary**, **profile**, **home**, **shell**, etc.

## State
- `src/store/madara-store.ts` (Zustand, persisted) holds client progress/settings/UI. `roadmapProgressById` is per-user node progress; `selectedPathRoadmapId` is the single active roadmap path.
- `src/components/shared/user-state-sync.tsx` syncs persisted Madara/Phonics state to DB via server actions.

## Data
- SQLite + Drizzle ORM. Schema in `src/db/schema/*.ts`, repos in `src/db/repositories/*`, migrations in `src/db/migrations`.
- Roadmaps/nodes/edges are content tables; per-user roadmap node progress is in `user_roadmap_node_progress`.

## Boundaries
- Keep reusable logic in modules/utils/types; avoid web-only APIs in shared/business logic intended for future mobile reuse.
- Server validates sensitive operations; client state is not authoritative.
