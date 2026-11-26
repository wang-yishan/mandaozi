"use client";

import type { VocabWord } from "@/types/madara";
import { DictionaryView } from "./dictionary-shared";

export function Hsk2Page({ vocab }: { vocab: VocabWord[] }) {
  return (
    <DictionaryView
      initialFilter="HSK2"
      title="HSK 2"
      subtitle="Kosakata HSK 2 · lanjutkan fondasi Mandarin-mu"
      vocab={vocab}
    />
  );
}
