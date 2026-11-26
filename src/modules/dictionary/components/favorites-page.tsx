"use client";

import type { VocabWord } from "@/types/madara";
import { DictionaryView } from "./dictionary-shared";

export function FavoritesPage({ vocab }: { vocab: VocabWord[] }) {
  return (
    <DictionaryView
      initialFilter="Favorites"
      title="Favorites"
      subtitle="Kata favorit yang kamu simpan untuk dipelajari lagi"
      vocab={vocab}
    />
  );
}
