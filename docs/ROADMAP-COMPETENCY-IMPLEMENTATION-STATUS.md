# Roadmap Competency Implementation Status

## Implemented (verified)
- **Migration 0004**: additive schema for competencies, learning items, assessments, mappings, rules, `user_roadmap_records`, branch choices, mastery, attempts. Partial unique index enforces **one selected roadmap per user** (`is_selected=1`); many completed records allowed.
- **Domain engines**: progression rule evaluator (AND/OR/threshold/assessment/mastery/branch choice/legacy prereq adapter), competency mastery engine (lesson != mastery), assessment grading + evidence emission, guided recommendation.
- **VM adapter**: `buildRoadmapNodeVMsWithProgression` falls back to legacy `prerequisiteIds`; supports rules, branch choices, mastery/assessment context, `competencyStates`, `masteredNodeIds/reviewRequiredNodeIds`, competency/resource/assessment enrichment, review_required mastery derivation.
- **DB repos/actions**: user roadmap records (single selected, many completed), branch choices, competency mastery persistence, assessment attempt persistence with idempotency, progression context loader (joins competency/assessment titles, attempt pass/score, mastery states), Zod-validated server actions.
- **UI wiring**: `useRoadmapProgress` + `DaoPage` + `PathSelectedSidebar` use progression adapter; DB progression context loaded in hook/Dao; detail bottom sheet shows competency/mastery/assessment/resource sections + recent attempts; **basic custom drag-to-close** on bottom sheet (no new dependency); `RoadmapRecommendedNext` used in Roadmaps and Dao with real resources; completed-roadmaps history in Dao and Roadmaps; dashboard roadmap preview status UI extended for mastered/review_required/in-progress/recommended.
- **Legacy backfill**: `bun run db:backfill` backfills unlock rules from prerequisiteIds, learning items/resources from lessonInfo, competencies/assessments/mappings per node, and `user_roadmap_records` (selected + completed). Tests verify backfill + adapter consumption.

## Key files
- Schema/migration: `src/db/schema/roadmap-competency.ts`, `src/db/migrations/0004_dry_ghost_rider.sql`
- Backfill: `src/db/backfill/legacy-roadmap-backfill.ts`, `src/db/backfill/run.ts`
- Engines: `src/modules/progression/*`, `src/modules/competencies/*`, `src/modules/assessments/*`, `src/modules/guided-learning/*`
- Adapter: `src/modules/roadmaps/utils/roadmap-progression-adapter.ts`
- Repos/actions: `src/db/repositories/{user-roadmap-records,competency-mastery,assessment-attempts,learning-resources,roadmap-progression}.repo.ts`, `src/app/actions/{roadmap,assessments,user-state}.ts`
- UI: `src/modules/roadmaps/components/{roadmap-detail-panel,roadmap-recommended-next,roadmaps-page}.tsx`, `src/modules/world/components/{dao-page,path-selected-sidebar}.tsx`, `src/modules/home/components/dashboard/roadmap-preview.tsx`

## Verification (latest run in this session)
```text
bunx tsc --noEmit --pretty false  # clean
bun test src/db/repositories/roadmap-db.integration.test.ts src/modules/roadmaps/utils/roadmap-progression-adapter.test.ts src/db/backfill/legacy-roadmap-backfill.test.ts
# 10 pass, 0 fail, 32 expect() calls
```
Previously reported passing: 21 domain/adapter tests, 4 DB/backfill tests.

## Remaining gaps / blockers (requires decision or environment)
- **Dashboard/profile real-data progression enrichment**: dashboard preview status UI is consistent, but `dashboard-data.ts` is heuristic; wiring to DB progression VM needs data-loading/caching decision.
- **Full mobile bottom-sheet gestures**: basic drag-to-close done; snap points/velocity/scroll-conflict need UX decision (extend custom or approve dependency).
- **Mapping quality / branch-choice legacy import**: deterministic baseline backfill exists; richer domain mapping and legacy localStorage branch-choice edge cases need product/content rules. Branch choices sync on save and via `migrateLocalStorageStateAction`.
- **Production migration/rollback verification**: local migration/backfill/tests verified; needs staging/prod-like DB copy + rollback policy.
- **AuthZ action integration tests**: actions depend on `auth.api.getSession`; needs approved auth mock/harness.
- **Cross-device sync/e2e tests**: needs browser/e2e harness and defined cross-device scenario.
- **Final API contract doc pass**: see `docs/ROADMAP-MIGRATION-AND-API.md`; finalize after blockers resolved.
