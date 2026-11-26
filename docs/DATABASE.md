# Database (SQLite + Drizzle)

## Overview

Mandaozi uses a local SQLite database as the canonical store for reference content and user progress.

- **Engine:** SQLite via `better-sqlite3`
- **ORM:** Drizzle ORM (`drizzle-orm/better-sqlite3`)
- **DB file:** `data/m.db` (override with `SQLITE_PATH`)
- **Schema:** `src/db/schema.ts` (re-exports `src/db/schema/content.ts`, `phonics.ts`, `users.ts`)
- **Migrations:** `src/db/migrations/`
- **Seed:** `src/db/seed/`

## Commands

```bash
bun run db:generate   # generate SQL migration from Drizzle schema
bun run db:migrate    # apply migrations
bun run db:push       # push schema directly (dev only)
bun run db:seed       # idempotent seed from source constants
bun run db:studio     # drizzle-kit studio
bun run db:reset      # delete local DB, migrate, seed
```

## Reference/Seed Tables

| Table | Source | Notes |
|---|---|---|
| `vocabulary_words` | `src/lib/vocab.ts` | HSK vocab; explicit `meaning_en`/`meaning_id` columns, mapped to legacy `VocabWord` shape in repo |
| `world_categories` | `src/modules/world/constants/world.ts` | World categories |
| `world_category_lessons` | `src/modules/world/constants/world.ts` | Lessons per category |
| `world_tone_options` | `src/modules/world/constants/world.ts` | Tone options |
| `roadmaps` | `src/modules/roadmaps/constants/roadmap-data.ts` | Roadmap definitions |
| `roadmap_nodes` | roadmap data | Node graph, positions, lesson info |
| `roadmap_node_prerequisites` | roadmap data | Normalized prerequisite edges |
| `roadmap_edges` | roadmap data | Visual/flow edges |
| `phonics_symbols` | `src/modules/practice-pinyin-zhuyin/constants/{pinyin,zhuyin}.ts` | Pinyin/Zhuyin symbols |
| `phonics_rules` | phonics constants | Rules/tips |
| `phonics_lessons` | phonics constants | Lesson metadata |
| `phonics_exercises` | phonics constants | Exercises; variant payloads stored as JSON columns |

## User/Progress Tables

| Table | Purpose |
|---|---|
| `users` | Local user identity (`local-user` until auth integration) |
| `user_profiles` | Settings/profile (goal, level, language, theme, onboarding, etc.) |
| `user_progress` | XP, streak, accuracy, counts |
| `user_favorites` | Favorite vocabulary hanzi |
| `user_task_completions` | Completed task IDs |
| `user_lesson_completions` | Completed lesson keys |
| `user_roadmap_node_progress` | Per-user roadmap node status (`completed`/`in-progress`) |
| `user_phonics_settings` | Phonics display/accent/playback/total XP |
| `phonics_lesson_progress` | Per-user phonics lesson progress |
| `phonics_symbol_progress` | Per-user symbol mastery |
| `phonics_incorrect_answers` | Incorrect answer review queue |

## Runtime Access Pattern

- **Server-only DB access:** import `db`/repos only from server components, server actions, or route handlers.
- **Repositories:** `src/db/repositories/*.repo.ts` return domain-shaped data.
- **Mappers:** `src/db/mappers/*.ts` isolate DB column naming from UI/domain types.
- **Client sync:** `src/components/shared/user-state-sync.tsx` hydrates Zustand stores from DB on mount, performs idempotent localStorage-to-DB migration when DB is empty, and debounces saves back to DB. DB is canonical; Zustand/localStorage act as client cache.

## Legacy

- `madara_records` may exist in older local DBs from the removed `/actions` generic KV route. It is not used by the app runtime. Keep/migrate only if it contains real data you need.
