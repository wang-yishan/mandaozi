import { asc, eq } from "drizzle-orm";
import type { WorldCategory } from "@/modules/world/constants/world";
import { db } from "../index";
import {
  worldCategories,
  worldCategoryLessons,
  worldToneOptions,
} from "../schema";

export async function listWorldCategories(): Promise<WorldCategory[]> {
  const cats = await db
    .select()
    .from(worldCategories)
    .orderBy(asc(worldCategories.sortOrder))
    .all();

  return Promise.all(
    cats.map(async (cat: any) => {
      const lessons = await db
        .select()
        .from(worldCategoryLessons)
        .where(eq(worldCategoryLessons.categoryId, cat.id))
        .orderBy(asc(worldCategoryLessons.sortOrder))
        .all();

      return {
        id: cat.id,
        name: cat.name,
        hanzi: cat.hanzi,
        pinyin: cat.subtitlePinyin,
        lessons: lessons.map((l: any) => l.title),
        xp: cat.xp,
        desc: cat.description,
      };
    }),
  );
}

export async function listWorldToneOptions(): Promise<string[]> {
  const rows = await db
    .select()
    .from(worldToneOptions)
    .orderBy(asc(worldToneOptions.sortOrder))
    .all();
  return rows.map((r: any) => r.label);
}
