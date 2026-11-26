export const instant = false;

import { notFound } from "next/navigation";
import {
  getPhonicsLesson,
  listPhonicsLessonsByScope,
} from "@/db/repositories/phonics.repo";
import { ResultPage } from "@/modules/practice-pinyin-zhuyin";

export default async function Page({
  params,
}: {
  params: Promise<{ scope: string; lessonId: string }>;
}) {
  const { scope, lessonId } = await params;
  if (scope !== "pinyin" && scope !== "zhuyin") notFound();

  const lesson = getPhonicsLesson(scope, lessonId);
  if (!lesson) notFound();
  const lessons = listPhonicsLessonsByScope(scope);

  return <ResultPage scope={scope} lesson={lesson} lessons={lessons} />;
}
