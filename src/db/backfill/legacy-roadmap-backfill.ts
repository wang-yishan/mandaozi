import { and, eq } from "drizzle-orm";
import { legacyPrerequisiteRule } from "@/modules/progression/engine";
import type { Db } from "../index";
import {
  assessmentCompetencies,
  assessments,
  competencies,
  learningItems,
  roadmapNodeAssessments,
  roadmapNodeCompetencies,
  roadmapNodePrerequisites,
  roadmapNodeResources,
  roadmapNodeRules,
  roadmapNodes,
  roadmaps,
  userProfiles,
  userRoadmapNodeProgress,
  userRoadmapRecords,
} from "../schema";

function now() {
  return new Date();
}

export function backfillLegacyRoadmapRules(database: Db) {
  const ts = now();
  const nodes = database.select().from(roadmapNodes).all();
  const prereqs = database.select().from(roadmapNodePrerequisites).all();
  const prereqsByNode = new Map<string, string[]>();
  for (const p of prereqs) {
    const list = prereqsByNode.get(p.nodeId) ?? [];
    list.push(p.prerequisiteNodeId);
    prereqsByNode.set(p.nodeId, list);
  }

  let created = 0;
  for (const node of nodes) {
    const prerequisiteIds = prereqsByNode.get(node.id) ?? [];
    const rule = legacyPrerequisiteRule(prerequisiteIds);
    if (!rule) continue;

    const ruleId = `rule:${node.id}:unlock:legacy`;
    const existing = database
      .select({ id: roadmapNodeRules.id })
      .from(roadmapNodeRules)
      .where(eq(roadmapNodeRules.id, ruleId))
      .get();
    if (existing) continue;

    database
      .insert(roadmapNodeRules)
      .values({
        id: ruleId,
        roadmapId: node.roadmapId,
        nodeId: node.id,
        ruleType: "unlock",
        ruleJson: rule,
        priority: 0,
        active: true,
        createdAt: ts,
        updatedAt: ts,
      })
      .onConflictDoNothing()
      .run();
    created++;
  }
  return { created };
}

export function backfillLegacyLearningResources(database: Db) {
  const ts = now();
  const nodes = database.select().from(roadmapNodes).all();
  let itemsUpserted = 0;
  let linksCreated = 0;
  let primariesSet = 0;

  for (const node of nodes) {
    const fallbackItemId = `li:node:${node.id}`;
    const kind = node.lessonKind ?? "lesson";
    const fallbackSourceRef = node.lessonHref ?? `node:${node.id}`;
    const fallbackTitle = node.lessonLabel?.trim() || node.title;

    const existingResources = database
      .select()
      .from(roadmapNodeResources)
      .where(eq(roadmapNodeResources.nodeId, node.id))
      .all();

    const existingPrimary = existingResources.find((r: any) => r.isPrimary);
    const preferred =
      existingPrimary ??
      existingResources.find(
        (r: any) => r.learningItemId === fallbackItemId,
      ) ??
      existingResources
        .slice()
        .sort((a: any, b: any) => {
          const aLearn = a.role === "learn" ? 0 : 1;
          const bLearn = b.role === "learn" ? 0 : 1;
          if (aLearn !== bLearn) return aLearn - bLearn;
          if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
          return a.learningItemId.localeCompare(b.learningItemId);
        })[0];

    const primaryItemId = preferred?.learningItemId ?? fallbackItemId;
    const primaryRole =
      preferred?.role ??
      (kind === "assessment"
        ? "assessment"
        : kind === "practice"
          ? "practice"
          : "learn");

    const existingItem = database
      .select()
      .from(learningItems)
      .where(eq(learningItems.id, primaryItemId))
      .get();

    if (!existingItem) {
      database
        .insert(learningItems)
        .values({
          id: primaryItemId,
          kind,
          title: fallbackTitle,
          sourceType: node.lessonHref ? "internal_route" : "content",
          sourceRef: fallbackSourceRef,
          estimatedMin: null,
          metaJson: { legacy: true, nodeId: node.id },
          active: true,
          createdAt: ts,
          updatedAt: ts,
        })
        .onConflictDoNothing()
        .run();
      itemsUpserted++;
    } else {
      // Conservative repair: fill missing/broken legacy fields, preserve curated values.
      const shouldRepairTitle =
        !existingItem.title?.trim() || existingItem.title === existingItem.id;
      const shouldRepairSource = !existingItem.sourceRef?.trim();
      if (
        shouldRepairTitle ||
        shouldRepairSource ||
        !existingItem.active
      ) {
        database
          .update(learningItems)
          .set({
            ...(shouldRepairTitle ? { title: fallbackTitle } : {}),
            ...(shouldRepairSource
              ? {
                  sourceRef: fallbackSourceRef,
                  sourceType: node.lessonHref ? "internal_route" : "content",
                }
              : {}),
            ...(!existingItem.active ? { active: true } : {}),
            updatedAt: ts,
          })
          .where(eq(learningItems.id, primaryItemId))
          .run();
      }
    }

    // Ensure the primary mapping exists.
    const hasPrimaryMapping = existingResources.some(
      (r: any) => r.learningItemId === primaryItemId && r.role === primaryRole,
    );
    if (!hasPrimaryMapping) {
      const res = database
        .insert(roadmapNodeResources)
        .values({
          nodeId: node.id,
          learningItemId: primaryItemId,
          role: primaryRole,
          sortOrder: preferred?.sortOrder ?? 0,
          isPrimary: false,
          unlockRuleJson: preferred?.unlockRuleJson ?? null,
        })
        .onConflictDoNothing()
        .run();
      if (Number(res.changes) > 0) linksCreated++;
    }

    // Ensure exactly one primary for this node.
    database
      .update(roadmapNodeResources)
      .set({ isPrimary: false })
      .where(eq(roadmapNodeResources.nodeId, node.id))
      .run();
    database
      .update(roadmapNodeResources)
      .set({ isPrimary: true })
      .where(
        and(
          eq(roadmapNodeResources.nodeId, node.id),
          eq(roadmapNodeResources.learningItemId, primaryItemId),
          eq(roadmapNodeResources.role, primaryRole),
        ),
      )
      .run();
    primariesSet++;

    // Also backfill a legacy item for nodes with lessonLabel but no primary mapping existed
    // (handled above) - no-op. Keep additional resources intact.
  }

  return { itemsUpserted, linksCreated, primariesSet };
}

export function backfillUserRoadmapRecords(database: Db) {
  const ts = now();
  const profiles = database.select().from(userProfiles).all();
  const allRoadmaps = database.select().from(roadmaps).all();
  const nodesByRoadmap = new Map<string, string[]>();
  for (const n of database.select().from(roadmapNodes).all()) {
    const list = nodesByRoadmap.get(n.roadmapId) ?? [];
    list.push(n.id);
    nodesByRoadmap.set(n.roadmapId, list);
  }

  let selectedUpserted = 0;
  let completedUpserted = 0;

  for (const profile of profiles) {
    const userId = profile.userId;

    if (profile.selectedPathRoadmapId) {
      const existing = database
        .select()
        .from(userRoadmapRecords)
        .where(
          and(
            eq(userRoadmapRecords.userId, userId),
            eq(userRoadmapRecords.roadmapId, profile.selectedPathRoadmapId),
          ),
        )
        .get();

      // clear other selected records for user
      database
        .update(userRoadmapRecords)
        .set({ isSelected: false, selectedAt: null, updatedAt: ts })
        .where(eq(userRoadmapRecords.userId, userId))
        .run();

      database
        .insert(userRoadmapRecords)
        .values({
          userId,
          roadmapId: profile.selectedPathRoadmapId,
          status: existing?.status === "completed" ? "completed" : "active",
          isSelected: true,
          selectedAt: ts,
          startedAt: existing?.startedAt ?? ts,
          completedAt: existing?.completedAt ?? null,
          lastOpenedAt: existing?.lastOpenedAt ?? ts,
          updatedAt: ts,
        })
        .onConflictDoUpdate({
          target: [userRoadmapRecords.userId, userRoadmapRecords.roadmapId],
          set: {
            isSelected: true,
            selectedAt: ts,
            status: existing?.status === "completed" ? "completed" : "active",
            updatedAt: ts,
          },
        })
        .run();
      selectedUpserted++;
    }

    const progressRows = database
      .select()
      .from(userRoadmapNodeProgress)
      .where(eq(userRoadmapNodeProgress.userId, userId))
      .all();
    const completedByRoadmap = new Map<string, Set<string>>();
    for (const r of progressRows) {
      if (r.status !== "completed") continue;
      const set = completedByRoadmap.get(r.roadmapId) ?? new Set<string>();
      set.add(r.nodeId);
      completedByRoadmap.set(r.roadmapId, set);
    }

    for (const roadmap of allRoadmaps) {
      const nodeIds = nodesByRoadmap.get(roadmap.id) ?? [];
      if (nodeIds.length === 0) continue;
      const doneSet = completedByRoadmap.get(roadmap.id);
      const isDone = !!doneSet && nodeIds.every((id) => doneSet.has(id));
      if (!isDone) continue;

      const existing = database
        .select()
        .from(userRoadmapRecords)
        .where(
          and(
            eq(userRoadmapRecords.userId, userId),
            eq(userRoadmapRecords.roadmapId, roadmap.id),
          ),
        )
        .get();

      database
        .insert(userRoadmapRecords)
        .values({
          userId,
          roadmapId: roadmap.id,
          status: "completed",
          isSelected: existing?.isSelected ?? false,
          selectedAt: existing?.selectedAt ?? null,
          startedAt: existing?.startedAt ?? ts,
          completedAt: existing?.completedAt ?? ts,
          lastOpenedAt: existing?.lastOpenedAt ?? ts,
          updatedAt: ts,
        })
        .onConflictDoUpdate({
          target: [userRoadmapRecords.userId, userRoadmapRecords.roadmapId],
          set: {
            status: "completed",
            completedAt: existing?.completedAt ?? ts,
            updatedAt: ts,
          },
        })
        .run();
      completedUpserted++;
    }
  }

  return { selectedUpserted, completedUpserted };
}

export function backfillLegacyCompetenciesAndAssessments(database: Db) {
  const ts = now();
  const nodes = database.select().from(roadmapNodes).all();
  let competencyCount = 0;
  let assessmentCount = 0;

  for (const node of nodes) {
    const competencyId = `cmp:node:${node.id}`;
    database
      .insert(competencies)
      .values({
        id: competencyId,
        slug: competencyId,
        title: node.title,
        description: node.description,
        domain: node.category,
        levelBand: null,
        rubricJson: { legacy: true, nodeId: node.id },
        active: true,
        createdAt: ts,
        updatedAt: ts,
      })
      .onConflictDoUpdate({
        target: competencies.id,
        set: {
          title: node.title,
          description: node.description,
          domain: node.category,
          active: true,
          updatedAt: ts,
        },
      })
      .run();
    competencyCount++;

    database
      .insert(roadmapNodeCompetencies)
      .values({
        nodeId: node.id,
        competencyId,
        relation: "primary",
        weight: 1,
      })
      .onConflictDoNothing()
      .run();

    const isAssessment =
      node.category === "assessment" || node.lessonKind === "assessment";
    if (isAssessment) {
      const assessmentId = `asm:node:${node.id}`;
      database
        .insert(assessments)
        .values({
          id: assessmentId,
          title: node.lessonLabel ?? `${node.title} Assessment`,
          kind: "quiz",
          mode: "auto",
          maxScore: 100,
          passScore: 70,
          configJson: { legacy: true, nodeId: node.id },
          active: true,
          createdAt: ts,
          updatedAt: ts,
        })
        .onConflictDoUpdate({
          target: assessments.id,
          set: {
            title: node.lessonLabel ?? `${node.title} Assessment`,
            active: true,
            updatedAt: ts,
          },
        })
        .run();
      assessmentCount++;

      database
        .insert(roadmapNodeAssessments)
        .values({
          nodeId: node.id,
          assessmentId,
          required: true,
          passScoreOverride: null,
          sortOrder: 0,
        })
        .onConflictDoNothing()
        .run();

      database
        .insert(assessmentCompetencies)
        .values({
          assessmentId,
          competencyId,
          weight: 1,
          minScore: 70,
        })
        .onConflictDoNothing()
        .run();
    }
  }

  return { competencyCount, assessmentCount };
}

export function runLegacyRoadmapBackfill(database: Db) {
  const rules = backfillLegacyRoadmapRules(database);
  const resources = backfillLegacyLearningResources(database);
  const competencies = backfillLegacyCompetenciesAndAssessments(database);
  const records = backfillUserRoadmapRecords(database);
  return { rules, resources, competencies, records };
}
