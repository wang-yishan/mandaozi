"use client";

import { DictionaryView } from "./dictionary-shared";

export function FavoritesPage() {
  return (
    <DictionaryView
      initialFilter="Favorites"
      title="Favorites"
      subtitle="Kata favorit yang kamu simpan untuk dipelajari lagi"
    />
  );
}
