export const instant = false;

import { listVocabulary } from "@/db/repositories/vocabulary.repo";
import { Hsk2Page } from "@/modules/dictionary";

export default async function Page() {
  const vocab = await listVocabulary();
  return <Hsk2Page vocab={vocab} />;
}
