import { afterEach, describe, expect, it } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "../schema";

function createTestDb() {
  const dir = mkdtempSync(join(tmpdir(), "mandaozi-db-"));
  const sqlitePath = join(dir, "test.db");
  const sqlite = new Database(sqlitePath);
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: "src/db/migrations" });
  return { db, sqlite, dir, sqlitePath };
}

const tempDirs: string[] = [];

afterEach(() => {
  while (tempDirs.length) {
    const dir = tempDirs.pop();
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
});

describe("roadmap DB integration", () => {
  it("enforces single selected roadmap per user and allows many completed roadmaps", () => {
    const t = createTestDb();
    tempDirs.push(t.dir);
    const { db } = t;
    const now = new Date();

    db.insert(schema.users)
      .values({
        id: "u1",
        name: "U1",
        email: "u1@example.com",
        emailVerified: false,
        createdAt: now,
        updatedAt: now,
      })
      .run();
    db.insert(schema.roadmaps)
      .values([
        { id: "r1", title: "R1", description: "d", sortOrder: 0 },
        { id: "r2", title: "R2", description: "d", sortOrder: 1 },
        { id: "r3", title: "R3", description: "d", sortOrder: 2 },
      ])
      .run();

    db.insert(schema.userRoadmapRecords)
      .values({
        userId: "u1",
        roadmapId: "r1",
        status: "active",
        isSelected: true,
        selectedAt: now,
        updatedAt: now,
      })
      .run();

    // second selected should fail because of partial unique index
    expect(() => {
      db.insert(schema.userRoadmapRecords)
        .values({
          userId: "u1",
          roadmapId: "r2",
          status: "active",
          isSelected: true,
          selectedAt: now,
          updatedAt: now,
        })
        .run();
    }).toThrow();

    // many completed roadmaps allowed
    db.insert(schema.userRoadmapRecords)
      .values({
        userId: "u1",
        roadmapId: "r2",
        status: "completed",
        isSelected: false,
        completedAt: now,
        updatedAt: now,
      })
      .run();
    db.insert(schema.userRoadmapRecords)
      .values({
        userId: "u1",
        roadmapId: "r3",
        status: "completed",
        isSelected: false,
        completedAt: now,
        updatedAt: now,
      })
      .run();

    const rows = db
      .select()
      .from(schema.userRoadmapRecords)
      .all()
      .filter((r) => r.userId === "u1");
    expect(rows.filter((r) => r.status === "completed")).toHaveLength(2);
    expect(rows.filter((r) => r.isSelected)).toHaveLength(1);

    t.sqlite.close();
  });

  it("supports idempotent assessment attempt unique key", () => {
    const t = createTestDb();
    tempDirs.push(t.dir);
    const { db } = t;
    const now = new Date();

    db.insert(schema.users)
      .values({
        id: "u1",
        name: "U1",
        email: "u2@example.com",
        emailVerified: false,
        createdAt: now,
        updatedAt: now,
      })
      .run();
    db.insert(schema.assessments)
      .values({
        id: "asm-1",
        title: "Quiz",
        kind: "quiz",
        mode: "auto",
        maxScore: 100,
        passScore: 70,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    db.insert(schema.userAssessmentAttempts)
      .values({
        id: "att-1",
        userId: "u1",
        assessmentId: "asm-1",
        status: "graded",
        score: 80,
        maxScore: 100,
        passed: true,
        idempotencyKey: "idem-1",
        createdAt: now,
        updatedAt: now,
      })
      .run();

    expect(() => {
      db.insert(schema.userAssessmentAttempts)
        .values({
          id: "att-2",
          userId: "u1",
          assessmentId: "asm-1",
          status: "graded",
          score: 80,
          maxScore: 100,
          passed: true,
          idempotencyKey: "idem-1",
          createdAt: now,
          updatedAt: now,
        })
        .run();
    }).toThrow();

    t.sqlite.close();
  });
});
