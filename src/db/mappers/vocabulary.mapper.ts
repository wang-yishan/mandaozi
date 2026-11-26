import type { VocabWord } from "@/types/madara";
import type { vocabularyWords } from "../schema";

type VocabWordRow = typeof vocabularyWords.$inferSelect;

export function mapVocabWordRow(row: VocabWordRow): VocabWord {
  return {
    hanzi: row.hanzi,
    pinyin: row.pinyin,
    id: row.meaningId,
    en: row.meaningEn,
    hsk: row.hskLevel,
    ex: row.exampleHanzi,
    exId: row.exampleMeaningId,
  };
}
