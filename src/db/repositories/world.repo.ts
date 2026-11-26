import { asc, eq } from "drizzle-orm";
import type { WorldCategory } from "@/modules/world/constants/world";
import { db } from "../index";
import {
  worldCategories,
  worldCategoryLessons,
  worldToneOptions,
} from "../schema";

export function listWorldCategories(): WorldCategory[] {
  const cats = db
    .select()
    .from(worldCategories)
    .orderBy(asc(worldCategories.sortOrder))
    .all();

  return cats.map((cat) => {
    const lessons = db
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
      lessons: lessons.map((l) => l.title),
      xp: cat.xp,
      desc: cat.description,
    };
  });
}

export function listWorldToneOptions(): string[] {
  const rows = db
    .select()
    .from(worldToneOptions)
    .orderBy(asc(worldToneOptions.sortOrder))
    .all();
  return rows.map((r) => r.label);
}
