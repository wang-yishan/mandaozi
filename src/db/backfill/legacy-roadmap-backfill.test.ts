import { afterEach, describe, expect, it } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "../schema";
import { runLegacyRoadmapBackfill } from "./legacy-roadmap-backfill";

function createTestDb() {
  const dir = mkdtempSync(join(tmpdir(), "mandaozi-backfill-"));
  const sqlite = new Database(join(dir, "test.db"));
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: "src/db/migrations" });
  return { db, sqlite, dir };
}

const dirs: string[] = [];
afterEach(() => {
  while (dirs.length) {
    const dir = dirs.pop();
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
});

describe("legacy roadmap backfill", () => {
  it("backfills rules, learning resources, and user roadmap records idempotently", () => {
    const t = createTestDb();
    dirs.push(t.dir);
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
    db.insert(schema.userProfiles)
      .values({
        userId: "u1",
        selectedPathRoadmapId: "r1",
        updatedAt: now,
      })
      .run();
    db.insert(schema.roadmaps)
      .values({ id: "r1", title: "R1", description: "d", sortOrder: 0 })
      .run();
    db.insert(schema.roadmapNodes)
      .values([
        {
          id: "n1",
          roadmapId: "r1",
          title: "N1",
          description: "d",
          category: "foundation",
          estimatedDuration: "10m",
          lessonKind: "lesson",
          lessonLabel: "Lesson 1",
          lessonHref: "/lesson/1",
          posX: 0,
          posY: 0,
          sortOrder: 0,
        },
        {
          id: "n2",
          roadmapId: "r1",
          title: "N2",
          description: "d",
          category: "practice",
          estimatedDuration: "10m",
          lessonKind: null,
          lessonLabel: null,
          lessonHref: null,
          posX: 0,
          posY: 100,
          sortOrder: 1,
        },
      ])
      .run();
    db.insert(schema.roadmapNodePrerequisites)
      .values({ nodeId: "n2", prerequisiteNodeId: "n1" })
      .run();
    db.insert(schema.userRoadmapNodeProgress)
      .values([
        {
          userId: "u1",
          roadmapId: "r1",
          nodeId: "n1",
          status: "completed",
          updatedAt: now,
        },
        {
          userId: "u1",
          roadmapId: "r1",
          nodeId: "n2",
          status: "completed",
          updatedAt: now,
        },
      ])
      .run();

    const first = runLegacyRoadmapBackfill(db);
    expect(first.rules.created).toBeGreaterThan(0);
    expect(first.resources.itemsUpserted).toBe(1);
    expect(first.competencies.competencyCount).toBe(2);
    expect(first.records.selectedUpserted).toBe(1);
    expect(first.records.completedUpserted).toBe(1);

    const rules = db.select().from(schema.roadmapNodeRules).all();
    expect(
      rules.some((r) => r.nodeId === "n2" && r.ruleType === "unlock"),
    ).toBe(true);

    const items = db.select().from(schema.learningItems).all();
    expect(items.some((i) => i.id === "li:node:n1")).toBe(true);

    const comps = db.select().from(schema.competencies).all();
    expect(comps.some((c) => c.id === "cmp:node:n1")).toBe(true);
    const nodeComps = db.select().from(schema.roadmapNodeCompetencies).all();
    expect(nodeComps.some((mc) => mc.nodeId === "n1")).toBe(true);

    const records = db.select().from(schema.userRoadmapRecords).all();
    const rec = records.find((r) => r.userId === "u1" && r.roadmapId === "r1");
    expect(rec?.isSelected).toBe(true);
    expect(rec?.status).toBe("completed");

    // idempotent
    const second = runLegacyRoadmapBackfill(db);
    expect(second.rules.created).toBe(0);
    const rulesAfter = db.select().from(schema.roadmapNodeRules).all();
    expect(rulesAfter.length).toBe(rules.length);

    t.sqlite.close();
  });

  it("backfilled rules/resources feed progression adapter", async () => {
    const t = createTestDb();
    dirs.push(t.dir);
    const { db } = t;
    const now = new Date();

    db.insert(schema.users)
      .values({ id: "u1", name: "U1", email: "u2@example.com", emailVerified: false, createdAt: now, updatedAt: now })
      .run();
    db.insert(schema.roadmaps)
      .values({ id: "r1", title: "R1", description: "d", sortOrder: 0 })
      .run();
    db.insert(schema.roadmapNodes)
      .values([
        { id: "n1", roadmapId: "r1", title: "N1", description: "d", category: "foundation", estimatedDuration: "10m", lessonKind: "lesson", lessonLabel: "L1", lessonHref: "/l1", posX: 0, posY: 0, sortOrder: 0 },
        { id: "n2", roadmapId: "r1", title: "N2", description: "d", category: "assessment", estimatedDuration: "10m", lessonKind: "assessment", lessonLabel: "A1", lessonHref: "/a1", posX: 0, posY: 1, sortOrder: 1 },
      ])
      .run();
    db.insert(schema.roadmapNodePrerequisites)
      .values({ nodeId: "n2", prerequisiteNodeId: "n1" })
      .run();

    runLegacyRoadmapBackfill(db);

    const { buildRoadmapNodeVMsWithProgression } = await import(
      "@/modules/roadmaps/utils/roadmap-progression-adapter"
    );
    const { progressionRuleSchema } = await import("@/modules/progression/rule-schema");

    const ruleRows = db.select().from(schema.roadmapNodeRules).all();
    const unlockRulesByNodeId: Record<string, any> = {};
    for (const r of ruleRows) {
      if (r.ruleType !== "unlock") continue;
      const parsed = progressionRuleSchema.safeParse(r.ruleJson);
      if (parsed.success) unlockRulesByNodeId[r.nodeId] = parsed.data;
    }

    const resources = db.select().from(schema.roadmapNodeResources).all();
    const items = db.select().from(schema.learningItems).all();
    const nodeResourcesByNodeId: Record<string, any[]> = {};
    for (const res of resources) {
      const item = items.find((i) => i.id === res.learningItemId);
      if (!item) continue;
      const list = nodeResourcesByNodeId[res.nodeId] ?? [];
      list.push({ id: item.id, title: item.title, kind: item.kind, href: item.sourceRef.startsWith("/") ? item.sourceRef : undefined, role: res.role });
      nodeResourcesByNodeId[res.nodeId] = list;
    }

    const vms = buildRoadmapNodeVMsWithProgression(
      {
        id: "r1",
        title: "R1",
        description: "d",
        nodes: [
          { id: "n1", title: "N1", description: "d", category: "foundation", estimatedDuration: "10m", prerequisiteIds: [], position: { x: 0, y: 0 } },
          { id: "n2", title: "N2", description: "d", category: "assessment", estimatedDuration: "10m", prerequisiteIds: ["n1"], position: { x: 0, y: 1 } },
        ],
        edges: [],
      },
      { completedNodeIds: [], inProgressNodeId: null },
      { unlockRulesByNodeId, nodeResourcesByNodeId },
    );

    expect(vms.find((n) => n.id === "n1")?.status).toBe("recommended");
    expect(vms.find((n) => n.id === "n2")?.status).toBe("locked");
    expect(vms.find((n) => n.id === "n1")?.resources?.[0]?.href).toBe("/l1");

    t.sqlite.close();
  });
});
