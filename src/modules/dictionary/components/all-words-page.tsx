"use client";

import type { VocabWord } from "@/types/madara";
import { DictionaryView } from "./dictionary-shared";

export function AllWordsPage({ vocab }: { vocab: VocabWord[] }) {
  return (
    <DictionaryView
      initialFilter="All"
      title="All Words"
      subtitle="Semua kosakata · Hanzi, Pinyin, English & Indonesia"
      vocab={vocab}
    />
  );
}
