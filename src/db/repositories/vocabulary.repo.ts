import { asc, eq } from "drizzle-orm";
import { db } from "../index";
import { mapVocabWordRow } from "../mappers/vocabulary.mapper";
import { vocabularyWords } from "../schema";

export function listVocabulary() {
  const rows = db
    .select()
    .from(vocabularyWords)
    .orderBy(asc(vocabularyWords.sortOrder))
    .all();
  return rows.map(mapVocabWordRow);
}

export function listVocabularyByHsk(hskLevel: string) {
  const rows = db
    .select()
    .from(vocabularyWords)
    .where(eq(vocabularyWords.hskLevel, hskLevel))
    .orderBy(asc(vocabularyWords.sortOrder))
    .all();
  return rows.map(mapVocabWordRow);
}

export function getVocabularyByHanzi(hanzi: string) {
  const row = db
    .select()
    .from(vocabularyWords)
    .where(eq(vocabularyWords.hanzi, hanzi))
    .get();
  return row ? mapVocabWordRow(row) : undefined;
}
