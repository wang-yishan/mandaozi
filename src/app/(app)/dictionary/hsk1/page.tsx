export const instant = false;

import { listVocabulary } from "@/db/repositories/vocabulary.repo";
import { Hsk1Page } from "@/modules/dictionary";

export default async function Page() {
  const vocab = await listVocabulary();
  return <Hsk1Page vocab={vocab} />;
}
