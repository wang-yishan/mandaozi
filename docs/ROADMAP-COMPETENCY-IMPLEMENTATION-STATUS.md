# Roadmap Competency Implementation Status

## Implemented (verified)
- **Migration 0004**: additive schema for competencies, learning items, assessments, mappings, rules, `user_roadmap_records`, branch choices, mastery, attempts. Partial unique index enforces **one selected roadmap per user** (`is_selected=1`); many completed records allowed.
- **Migration 0005**: additive `roadmap_node_resources.is_primary` + partial unique index `roadmap_node_resources_one_primary_uq` (one primary per node).
- **Domain engines**: progression rule evaluator (AND/OR/threshold/assessment/mastery/branch choice/legacy prereq adapter), competency mastery engine (lesson != mastery), assessment grading + evidence emission, guided recommendation.
- **VM adapter**: `buildRoadmapNodeVMsWithProgression` always emits `learningItemId`, `masteryHref`, `sourceHref?`, `unlocked/canOpen/canComplete`, unlock rule and failed/satisfied conditions; falls back to legacy `prerequisiteIds`; supports rules, branch choices, mastery/assessment context, `primaryLearningItemByNodeId`, `competencyStates`, `masteredNodeIds/reviewRequiredNodeIds`, competency/resource/assessment enrichment, review_required mastery derivation.
- **Mastery (individual learning cards)**: `/mastery` lists active learning items; `/mastery/[learningItemId]` renders card, source action, roadmap context/prerequisites, occurrences, and completion button. No new table; reuses `learning_items`.
- **Navigation**: Roadmaps/Dao/RecommendedNext/DetailPanel open `masteryHref` (not raw `lessonInfo.href`). Original source preserved as `sourceHref`.
- **Server-authoritative completion**: `completeMasteryCardAction` (Zod+auth) verifies node/resource ownership, checks unlock server-side, upserts `user_learning_item_progress`, completes `user_roadmap_node_progress` only when unlocked and required assessments pass; idempotent by natural DB state. No manual review.
- **State sync safety**: `saveMadaraPersistedState` merges roadmap progress so server-completed nodes are not downgraded by stale client snapshots.
- **Backfill**: `bun run db:backfill` now backfills unlock rules, primary learning items/resources for **every** node (including nodes without `lessonLabel/lessonHref`), competencies/assessments/mappings, and `user_roadmap_records`. Idempotent.
- **No manual review active flow**: legacy `review_required` mapped to learning/retry; completion and unlock are automatic when requirements pass.

## Key files
- Schema/migration: `src/db/schema/roadmap-competency.ts`, `src/db/migrations/0004_dry_ghost_rider.sql`, `src/db/migrations/0005_mastery_primary_learning_item.sql`
- Backfill: `src/db/backfill/legacy-roadmap-backfill.ts`, `src/db/backfill/run.ts`
- Engines: `src/modules/progression/*`, `src/modules/competencies/*`, `src/modules/assessments/*`, `src/modules/guided-learning/*`
- Mastery: `src/modules/mastery/{lib,components,types}/*`, `src/app/(app)/mastery/page.tsx`, `src/app/(app)/mastery/[learningItemId]/page.tsx`, `src/app/actions/mastery.ts`, `src/db/repositories/mastery.repo.ts`
- Adapter: `src/modules/roadmaps/utils/roadmap-progression-adapter.ts`
- Repos/actions: `src/db/repositories/{user-roadmap-records,competency-mastery,assessment-attempts,learning-resources,roadmap-progression,user-state}.repo.ts`, `src/app/actions/{roadmap,assessments,user-state,mastery}.ts`
- UI: `src/modules/roadmaps/components/{roadmap-detail-panel,roadmap-recommended-next,roadmaps-page}.tsx`, `src/modules/world/components/{dao-page,path-selected-sidebar}.tsx`

## Verification (latest run in this session)
```text
bunx tsc --noEmit --pretty false  # clean

bun test src/modules/progression/engine.test.ts \
  src/modules/competencies/engine.test.ts \
  src/modules/assessments/engine.test.ts \
  src/modules/assessments/assessment-mastery-flow.test.ts \
  src/modules/guided-learning/engine.test.ts \
  src/modules/roadmaps/utils/roadmap-progression-adapter.test.ts \
  src/db/repositories/roadmap-db.integration.test.ts \
  src/db/backfill/legacy-roadmap-backfill.test.ts
# 28 pass, 0 fail, 98 expect() calls

bun run db:backfill
# resources: { itemsUpserted: 13, linksCreated: 13, primariesSet: 13 } (for 13 nodes)
```

## Remaining gaps / blockers (requires decision or environment)
- **AuthZ action integration tests**: actions depend on `auth.api.getSession`; needs approved auth mock/harness.
- **Cross-device sync/e2e tests**: needs browser/e2e harness and defined cross-device scenario.
- **Production migration/rollback verification**: local migration/backfill/tests verified; needs staging/prod-like DB copy + rollback policy.
- **Richer domain mapping quality**: deterministic baseline backfill exists; curated competency/assessment/resource authoring needs product/content rules.
- **Full mobile bottom-sheet gestures**: basic drag-to-close done; snap points/velocity/scroll-conflict need UX decision.
- **Dashboard/profile real-data progression enrichment**: dashboard still heuristic in some places.
