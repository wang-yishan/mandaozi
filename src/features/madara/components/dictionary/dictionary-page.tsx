"use client";

import { DictionaryView } from "./dictionary-shared";

export function DictionaryPage() {
  return (
    <DictionaryView
      initialFilter="All"
      title="Dictionary"
      subtitle="Kamus Mandarin · Hanzi, Pinyin, English & Indonesia"
    />
  );
}
