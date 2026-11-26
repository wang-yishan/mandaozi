export const instant = false;

import { listPhonicsLessonsByScope } from "@/db/repositories/phonics.repo";
import { PhonicsProgressPage } from "@/modules/practice-pinyin-zhuyin";

export default async function Page() {
  const lessonsByScope = {
    pinyin: listPhonicsLessonsByScope("pinyin"),
    zhuyin: listPhonicsLessonsByScope("zhuyin"),
  } as const;
  return <PhonicsProgressPage lessonsByScope={lessonsByScope} />;
}
