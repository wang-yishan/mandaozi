import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../index";
import {
  userProfiles,
  userRoadmapBranchChoices,
  userRoadmapRecords,
} from "../schema";

export type UserRoadmapRecordStatus = "active" | "completed" | "archived";

export interface UserRoadmapRecord {
  userId: string;
  roadmapId: string;
  status: UserRoadmapRecordStatus;
  isSelected: boolean;
  selectedAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  lastOpenedAt: Date | null;
  updatedAt: Date;
}

function toRecord(
  row: typeof userRoadmapRecords.$inferSelect,
): UserRoadmapRecord {
  return {
    userId: row.userId,
    roadmapId: row.roadmapId,
    status: row.status as UserRoadmapRecordStatus,
    isSelected: row.isSelected,
    selectedAt: row.selectedAt ?? null,
    startedAt: row.startedAt ?? null,
    completedAt: row.completedAt ?? null,
    lastOpenedAt: row.lastOpenedAt ?? null,
    updatedAt: row.updatedAt,
  };
}

export function listUserRoadmapRecords(userId: string): UserRoadmapRecord[] {
  return db
    .select()
    .from(userRoadmapRecords)
    .where(eq(userRoadmapRecords.userId, userId))
    .orderBy(desc(userRoadmapRecords.updatedAt))
    .all()
    .map(toRecord);
}

export function listCompletedRoadmaps(userId: string): UserRoadmapRecord[] {
  return db
    .select()
    .from(userRoadmapRecords)
    .where(
      and(
        eq(userRoadmapRecords.userId, userId),
        eq(userRoadmapRecords.status, "completed"),
      ),
    )
    .orderBy(desc(userRoadmapRecords.completedAt))
    .all()
    .map(toRecord);
}

export function getSelectedRoadmapRecord(
  userId: string,
): UserRoadmapRecord | null {
  const row = db
    .select()
    .from(userRoadmapRecords)
    .where(
      and(
        eq(userRoadmapRecords.userId, userId),
        eq(userRoadmapRecords.isSelected, true),
      ),
    )
    .get();
  return row ? toRecord(row) : null;
}

/**
 * Enforces single selected roadmap per user.
 * Keeps user_profiles.selected_path_roadmap_id as denormalized cache for backward compatibility.
 */
export function setSelectedRoadmap(
  userId: string,
  roadmapId: string | null,
): void {
  const now = new Date();
  db.transaction((tx) => {
    tx.update(userRoadmapRecords)
      .set({ isSelected: false, selectedAt: null, updatedAt: now })
      .where(
        and(
          eq(userRoadmapRecords.userId, userId),
          eq(userRoadmapRecords.isSelected, true),
        ),
      )
      .run();

    if (roadmapId) {
      const existing = tx
        .select()
        .from(userRoadmapRecords)
        .where(
          and(
            eq(userRoadmapRecords.userId, userId),
            eq(userRoadmapRecords.roadmapId, roadmapId),
          ),
        )
        .get();

      tx.insert(userRoadmapRecords)
        .values({
          userId,
          roadmapId,
          status: existing?.status === "completed" ? "completed" : "active",
          isSelected: true,
          selectedAt: now,
          startedAt: existing?.startedAt ?? now,
          completedAt: existing?.completedAt ?? null,
          lastOpenedAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [userRoadmapRecords.userId, userRoadmapRecords.roadmapId],
          set: {
            isSelected: true,
            selectedAt: now,
            lastOpenedAt: now,
            updatedAt: now,
            status: existing?.status === "completed" ? "completed" : "active",
          },
        })
        .run();
    }

    tx.insert(userProfiles)
      .values({ userId, selectedPathRoadmapId: roadmapId, updatedAt: now })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: { selectedPathRoadmapId: roadmapId, updatedAt: now },
      })
      .run();
  });
}

/**
 * Marks roadmap as completed for user (many completed roadmaps allowed).
 * Does not change single-selected constraint; selected roadmap can remain selected.
 */
export function markRoadmapCompleted(
  userId: string,
  roadmapId: string,
  completedAt = new Date(),
): void {
  const now = new Date();
  db.transaction((tx) => {
    const existing = tx
      .select()
      .from(userRoadmapRecords)
      .where(
        and(
          eq(userRoadmapRecords.userId, userId),
          eq(userRoadmapRecords.roadmapId, roadmapId),
        ),
      )
      .get();

    tx.insert(userRoadmapRecords)
      .values({
        userId,
        roadmapId,
        status: "completed",
        isSelected: existing?.isSelected ?? false,
        selectedAt: existing?.selectedAt ?? null,
        startedAt: existing?.startedAt ?? now,
        completedAt,
        lastOpenedAt: existing?.lastOpenedAt ?? now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [userRoadmapRecords.userId, userRoadmapRecords.roadmapId],
        set: {
          status: "completed",
          completedAt,
          updatedAt: now,
        },
      })
      .run();
  });
}

export function countCompletedRoadmaps(userId: string): number {
  const row = db
    .select({ count: sql<number>`count(*)` })
    .from(userRoadmapRecords)
    .where(
      and(
        eq(userRoadmapRecords.userId, userId),
        eq(userRoadmapRecords.status, "completed"),
      ),
    )
    .get();
  return row?.count ?? 0;
}

export function setUserRoadmapBranchChoice(args: {
  userId: string;
  roadmapId: string;
  choiceNodeId: string;
  choiceId: string | null;
}): void {
  const now = new Date();
  db.transaction((tx) => {
    if (!args.choiceId) {
      tx.delete(userRoadmapBranchChoices)
        .where(
          and(
            eq(userRoadmapBranchChoices.userId, args.userId),
            eq(userRoadmapBranchChoices.roadmapId, args.roadmapId),
            eq(userRoadmapBranchChoices.choiceNodeId, args.choiceNodeId),
          ),
        )
        .run();
      return;
    }

    tx.insert(userRoadmapBranchChoices)
      .values({
        userId: args.userId,
        roadmapId: args.roadmapId,
        choiceNodeId: args.choiceNodeId,
        choiceId: args.choiceId,
        selectedAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [
          userRoadmapBranchChoices.userId,
          userRoadmapBranchChoices.roadmapId,
          userRoadmapBranchChoices.choiceNodeId,
        ],
        set: { choiceId: args.choiceId, selectedAt: now, updatedAt: now },
      })
      .run();
  });
}

export function listUserRoadmapBranchChoices(
  userId: string,
  roadmapId: string,
): Record<string, string> {
  const rows = db
    .select()
    .from(userRoadmapBranchChoices)
    .where(
      and(
        eq(userRoadmapBranchChoices.userId, userId),
        eq(userRoadmapBranchChoices.roadmapId, roadmapId),
      ),
    )
    .all();
  const out: Record<string, string> = {};
  for (const r of rows) out[r.choiceNodeId] = r.choiceId;
  return out;
}
