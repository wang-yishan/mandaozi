import {
  WORLD_CATEGORIES,
  WORLD_TONE_OPTIONS,
} from "../../modules/world/constants/world";
import { db } from "../index";
import {
  worldCategories,
  worldCategoryLessons,
  worldToneOptions,
} from "../schema";

export function seedWorld() {
  for (let i = 0; i < WORLD_CATEGORIES.length; i++) {
    const cat = WORLD_CATEGORIES[i];
    db.insert(worldCategories)
      .values({
        id: cat.id,
        name: cat.name,
        hanzi: cat.hanzi,
        subtitlePinyin: cat.pinyin,
        description: cat.desc,
        xp: cat.xp,
        sortOrder: i,
      })
      .onConflictDoUpdate({
        target: worldCategories.id,
        set: {
          name: cat.name,
          hanzi: cat.hanzi,
          subtitlePinyin: cat.pinyin,
          description: cat.desc,
          xp: cat.xp,
          sortOrder: i,
        },
      })
      .run();

    for (let j = 0; j < cat.lessons.length; j++) {
      const lessonTitle = cat.lessons[j];
      const lessonId = `${cat.id}-lesson-${j + 1}`;
      const kind =
        lessonTitle.toLowerCase().includes("assessment") ? "assessment" : "lesson";
      db.insert(worldCategoryLessons)
        .values({
          id: lessonId,
          categoryId: cat.id,
          title: lessonTitle,
          kind,
          sortOrder: j,
        })
        .onConflictDoUpdate({
          target: worldCategoryLessons.id,
          set: {
            categoryId: cat.id,
            title: lessonTitle,
            kind,
            sortOrder: j,
          },
        })
        .run();
    }
  }

  for (let i = 0; i < WORLD_TONE_OPTIONS.length; i++) {
    const label = WORLD_TONE_OPTIONS[i];
    const id = `tone-opt-${i + 1}`;
    db.insert(worldToneOptions)
      .values({ id, label, sortOrder: i })
      .onConflictDoUpdate({
        target: worldToneOptions.id,
        set: { label, sortOrder: i },
      })
      .run();
  }

  return {
    categories: WORLD_CATEGORIES.length,
    toneOptions: WORLD_TONE_OPTIONS.length,
  };
}
