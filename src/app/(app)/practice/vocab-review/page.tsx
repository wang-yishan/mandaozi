export const instant = false;

import { listVocabulary } from "@/db/repositories/vocabulary.repo";
import { VocabReviewPage } from "@/modules/practice";

export default async function Page() {
  const vocab = await listVocabulary();
  return <VocabReviewPage vocab={vocab} />;
}
