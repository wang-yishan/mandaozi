"use client";

import type { VocabWord } from "@/types/madara";
import { DictionaryView } from "./dictionary-shared";

export function DictionaryPage({ vocab }: { vocab: VocabWord[] }) {
  return (
    <DictionaryView
      initialFilter="All"
      title="Dictionary"
      subtitle="Kamus Mandarin · Hanzi, Pinyin, English & Indonesia"
      vocab={vocab}
    />
  );
}
