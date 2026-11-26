"use client";

import type { VocabWord } from "@/types/madara";
import { DictionaryView } from "./dictionary-shared";

export function Hsk1Page({ vocab }: { vocab: VocabWord[] }) {
  return (
    <DictionaryView
      initialFilter="HSK1"
      title="HSK 1"
      subtitle="Kosakata HSK 1 · dasar untuk pemula"
      vocab={vocab}
    />
  );
}
