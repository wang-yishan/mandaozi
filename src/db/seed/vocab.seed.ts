import { VOCAB } from "../../lib/vocab";
import { db } from "../index";
import { vocabularyWords } from "../schema";

export function seedVocabulary() {
  const rows = VOCAB.map((v, i) => ({
    id: `vocab-${String(i + 1).padStart(3, "0")}`,
    hanzi: v.hanzi,
    pinyin: v.pinyin,
    meaningEn: v.en,
    meaningId: v.id,
    hskLevel: v.hsk,
    exampleHanzi: v.ex,
    exampleMeaningId: v.exId,
    audioUrl: null as string | null,
    sortOrder: i,
  }));

  db.insert(vocabularyWords)
    .values(rows)
    .onConflictDoUpdate({
      target: vocabularyWords.id,
      set: {
        hanzi: vocabularyWords.hanzi,
        pinyin: vocabularyWords.pinyin,
        meaningEn: vocabularyWords.meaningEn,
        meaningId: vocabularyWords.meaningId,
        hskLevel: vocabularyWords.hskLevel,
        exampleHanzi: vocabularyWords.exampleHanzi,
        exampleMeaningId: vocabularyWords.exampleMeaningId,
        sortOrder: vocabularyWords.sortOrder,
      },
    })
    .run();

  // Ensure upsert updates values (drizzle sqlite upsert set needs sql/excluded refs; easier to do manual loop for clarity)
}

export function seedVocabularyIdempotent() {
  const rows = VOCAB.map((v, i) => ({
    id: `vocab-${String(i + 1).padStart(3, "0")}`,
    hanzi: v.hanzi,
    pinyin: v.pinyin,
    meaningEn: v.en,
    meaningId: v.id,
    hskLevel: v.hsk,
    exampleHanzi: v.ex,
    exampleMeaningId: v.exId,
    audioUrl: null as string | null,
    sortOrder: i,
  }));

  for (const row of rows) {
    db.insert(vocabularyWords)
      .values(row)
      .onConflictDoUpdate({
        target: vocabularyWords.id,
        set: {
          hanzi: row.hanzi,
          pinyin: row.pinyin,
          meaningEn: row.meaningEn,
          meaningId: row.meaningId,
          hskLevel: row.hskLevel,
          exampleHanzi: row.exampleHanzi,
          exampleMeaningId: row.exampleMeaningId,
          audioUrl: row.audioUrl,
          sortOrder: row.sortOrder,
        },
      })
      .run();
  }

  return rows.length;
}
