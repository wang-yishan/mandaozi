"use client";

import { DictionaryView } from "./dictionary-shared";

export function AllWordsPage() {
  return (
    <DictionaryView
      initialFilter="All"
      title="All Words"
      subtitle="Semua kosakata · Hanzi, Pinyin, English & Indonesia"
    />
  );
}
