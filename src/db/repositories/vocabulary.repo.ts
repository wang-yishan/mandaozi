import { asc, eq } from "drizzle-orm";
import { db } from "../index";
import { mapVocabWordRow } from "../mappers/vocabulary.mapper";
import { vocabularyWords } from "../schema";

export async function listVocabulary() {
  const rows = await db
    .select()
    .from(vocabularyWords)
    .orderBy(asc(vocabularyWords.sortOrder))
    .all();
  return rows.map(mapVocabWordRow);
}

export async function listVocabularyByHsk(hskLevel: string) {
  const rows = await db
    .select()
    .from(vocabularyWords)
    .where(eq(vocabularyWords.hskLevel, hskLevel))
    .orderBy(asc(vocabularyWords.sortOrder))
    .all();
  return rows.map(mapVocabWordRow);
}

export async function getVocabularyByHanzi(hanzi: string) {
  const row = await db
    .select()
    .from(vocabularyWords)
    .where(eq(vocabularyWords.hanzi, hanzi))
    .get();
  return row ? mapVocabWordRow(row) : undefined;
}
