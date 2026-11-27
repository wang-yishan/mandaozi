# Roadmap Migration & API (Current Implementation)

## 1. Database / Migration
- **Additive migration:** `src/db/migrations/0004_dry_ghost_rider.sql`
- **Key tables:** `competencies`, `learning_items`, `assessments`, mappings, `roadmap_node_rules`, `user_roadmap_records`, `user_roadmap_branch_choices`, `user_competency_mastery`, `user_assessment_attempts`, `user_learning_item_progress`.
- **Single selected roadmap per user:** partial unique index `user_roadmap_one_selected_uq` on `user_roadmap_records(user_id)` where `is_selected=1`.
- **Many completed roadmaps per user:** multiple `user_roadmap_records` rows with `status='completed'`; `completed_at` set.
- **Idempotent assessment attempts:** unique `(user_id, assessment_id, idempotency_key)`.

## 2. Legacy Backfill
Run: `bun run db:backfill` (`src/db/backfill/run.ts`)

Idempotent backfill:
- `prerequisiteIds` -> `roadmap_node_rules` legacy unlock rules (`rule:<nodeId>:unlock:legacy`)
- `lessonInfo` -> `learning_items` + `roadmap_node_resources`
- node -> baseline competency (`cmp:node:<nodeId>`) + assessment mapping for assessment nodes
- `user_profiles.selected_path_roadmap_id` + completed node progress -> `user_roadmap_records`

## 3. Server Actions (Zod + auth)
### `src/app/actions/user-state.ts`
- `loadUserStateAction()` - loads Madara/Phonics persisted state.
- `saveMadaraStateAction(state)` - Zod validated; saves snapshot; syncs `roadmapChoiceById` to `user_roadmap_branch_choices`; syncs `selectedPathRoadmapId` to `user_roadmap_records` (single-selected) and `user_profiles.selected_path_roadmap_id` cache.
- `savePhonicsStateAction(state)` - Zod validated.
- `migrateLocalStorageStateAction({madara,phonics})` - Zod validated, migrates only when DB has no state.

### `src/app/actions/roadmap.ts`
- `setSelectedRoadmapAction({roadmapId})` - sets single selected roadmap.
- `setRoadmapBranchChoiceAction({roadmapId,choiceNodeId,choiceId})` - persists branch choice.
- `listUserRoadmapRecordsAction()` - returns records + completed records.
- `getRoadmapProgressionContextAction({roadmapId,nodeIds})` - returns rules, branch choices, mastery, assessment pass/score, node competency/resource/assessment mappings.

### `src/app/actions/assessments.ts`
- `submitAssessmentAttemptAction(input)` - Zod validated; idempotent by `idempotencyKey`; grades auto assessment; persists attempt and emitted competency evidence.
- `listAssessmentAttemptsAction({roadmapId?,nodeId?,limit?})` - returns recent attempts.

## 4. VM / UI Wiring
- `buildRoadmapNodeVMsWithProgression` falls back to legacy prerequisiteIds when no explicit rules exist.
- Hook/Dao load DB progression context and pass rules/mastery/assessment/branch choices/enrichment into adapter, including `competencyStates`, `masteredNodeIds`, `reviewRequiredNodeIds`.
- Detail bottom sheet shows competency/mastery, assessment, resources, recent attempts; includes basic custom drag-to-close on mobile (no new dependency).
- `RoadmapRecommendedNext` shows guided next action/resources in Roadmaps and Dao.
- Dao and Roadmaps show completed-roadmaps history.
- Dashboard roadmap preview status UI handles mastered/review_required/in-progress/recommended; data source is still heuristic (not full DB progression VM).

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
