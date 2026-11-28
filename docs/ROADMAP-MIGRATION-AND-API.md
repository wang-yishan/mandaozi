# Roadmap Migration & API (Current Implementation)

## 1. Database / Migration
- **Additive migrations:**
  - `src/db/migrations/0004_dry_ghost_rider.sql` - competency/assessment/progression/record tables.
  - `src/db/migrations/0005_mastery_primary_learning_item.sql` - adds `roadmap_node_resources.is_primary` and partial unique index `roadmap_node_resources_one_primary_uq` (`node_id` WHERE `is_primary=1`).
- **Key tables:** `competencies`, `learning_items`, `assessments`, mappings, `roadmap_node_rules`, `user_roadmap_records`, `user_roadmap_branch_choices`, `user_competency_mastery`, `user_assessment_attempts`, `user_learning_item_progress`.
- **Single selected roadmap per user:** partial unique index `user_roadmap_one_selected_uq` on `user_roadmap_records(user_id)` where `is_selected=1`.
- **Many completed roadmaps per user:** multiple `user_roadmap_records` rows with `status='completed'`; `completed_at` set.
- **One primary learning item per roadmap node:** `roadmap_node_resources.is_primary` + partial unique index.
- **Idempotent assessment attempts:** unique `(user_id, assessment_id, idempotency_key)`.

## 2. Legacy Backfill
Run: `bun run db:backfill` (`src/db/backfill/run.ts`)

Idempotent backfill:
- `prerequisiteIds` -> `roadmap_node_rules` legacy unlock rules (`rule:<nodeId>:unlock:legacy`)
- Every roadmap node gets a canonical primary `learning_items` row (`li:node:<nodeId>` fallback) and a primary `roadmap_node_resources` mapping, even when `lessonLabel`/`lessonHref` are missing.
- Preserves existing source refs/titles where valid; repairs missing title/source/active conservatively.
- node -> baseline competency (`cmp:node:<nodeId>`) + assessment mapping for assessment nodes
- `user_profiles.selected_path_roadmap_id` + completed node progress -> `user_roadmap_records`

## 3. Server Actions (Zod + auth)
### `src/app/actions/user-state.ts`
- `loadUserStateAction()` - loads Madara/Phonics persisted state.
- `saveMadaraStateAction(state)` - Zod validated; saves snapshot; syncs `roadmapChoiceById` to `user_roadmap_branch_choices`; syncs `selectedPathRoadmapId` to `user_roadmap_records` (single-selected) and `user_profiles.selected_path_roadmap_id` cache. Roadmap node progress is merged so server-completed nodes are not downgraded by stale client snapshots.
- `savePhonicsStateAction(state)` - Zod validated.
- `migrateLocalStorageStateAction({madara,phonics})` - Zod validated, migrates only when DB has no state.

### `src/app/actions/roadmap.ts`
- `setSelectedRoadmapAction({roadmapId})` - sets single selected roadmap.
- `setRoadmapBranchChoiceAction({roadmapId,choiceNodeId,choiceId})` - persists branch choice.
- `listUserRoadmapRecordsAction()` - returns records + completed records.
- `getRoadmapProgressionContextAction({roadmapId,nodeIds})` - returns rules, branch choices, mastery, assessment pass/score, node competency/resource/assessment mappings, and `primaryLearningItemByNodeId`.

### `src/app/actions/assessments.ts`
- `submitAssessmentAttemptAction(input)` - Zod validated; idempotent by `idempotencyKey`; grades auto assessment; persists attempt and emitted competency evidence.
- `listAssessmentAttemptsAction({roadmapId?,nodeId?,limit?})` - returns recent attempts.

### `src/app/actions/mastery.ts`
- `completeMasteryCardAction({learningItemId,roadmapId?,nodeId?,idempotencyKey?})` - auth+Zod; verifies learning item belongs to node/resource; checks unlock server-side via progression engine; upserts `user_learning_item_progress`; marks `user_roadmap_node_progress` completed only when unlocked and required assessments pass; returns next `masteryHref` and completed node ids. No manual review.

## 4. VM / UI Wiring
- `buildRoadmapNodeVMsWithProgression` always emits `learningItemId`, `masteryHref`, `sourceHref?`, `unlocked`, `canOpen`, `canComplete`, unlock rule and failed/satisfied conditions. It falls back to `li:node:<nodeId>` when primary mapping is missing.
- `masteryHref` contract: `/mastery/<encoded-learningItemId>?roadmapId=<roadmapId>&nodeId=<nodeId>&...` . `learningItemId` is stable card identity; `roadmapId+nodeId` are occurrence context.
- Roadmap primary navigation (Roadmaps, Dao, Recommended Next, Detail Panel) opens `masteryHref`, not raw `lessonInfo.href`. Original source is preserved as `sourceHref`.
- `/mastery` lists individual active learning cards. `/mastery/[learningItemId]` renders a card, optional roadmap context, prerequisites from roadmap progression, source action, and completion action.
- `completeMasteryCardAction` is the server-authoritative completion path; UI can update Zustand optimistically but should reconcile with server result.
- Hook/Dao load DB progression context and pass rules/mastery/assessment/branch choices/enrichment into adapter, including `primaryLearningItemByNodeId`, `competencyStates`, `masteredNodeIds`, `reviewRequiredNodeIds`.
- Detail bottom sheet shows competency/mastery, assessment, resources, recent attempts; includes basic custom drag-to-close on mobile (no new dependency).

## 5. Verification Commands
```bash
bunx tsc --noEmit --pretty false
bun test src/modules/progression/engine.test.ts src/modules/competencies/engine.test.ts src/modules/assessments/engine.test.ts src/modules/assessments/assessment-mastery-flow.test.ts src/modules/guided-learning/engine.test.ts src/modules/roadmaps/utils/roadmap-progression-adapter.test.ts
bun test src/db/repositories/roadmap-db.integration.test.ts src/db/backfill/legacy-roadmap-backfill.test.ts
bun run db:backfill
```

## 6. Known Gaps / Blockers
- Full e2e/cross-device/authZ action tests require test harness/environment decisions (auth mocking, browser e2e setup).
- Richer competency/assessment authoring and production backfill verification/rollback need product/content decisions.
- Mastered/review-required derivation can be further strengthened when more mastery/assessment evidence is persisted across all flows.
