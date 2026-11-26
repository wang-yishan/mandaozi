export const instant = false;

import { listVocabulary } from "@/db/repositories/vocabulary.repo";
import { FavoritesPage } from "@/modules/dictionary";

export default async function Page() {
  const vocab = listVocabulary();
  return <FavoritesPage vocab={vocab} />;
}
