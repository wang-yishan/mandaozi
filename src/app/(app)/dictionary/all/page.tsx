export const instant = false;

import { listVocabulary } from "@/db/repositories/vocabulary.repo";
import { AllWordsPage } from "@/modules/dictionary";

export default async function Page() {
  const vocab = await listVocabulary();
  return <AllWordsPage vocab={vocab} />;
}
