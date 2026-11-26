export const instant = false;

import { notFound } from "next/navigation";
import {
  getPhonicsLesson,
  getPhonicsRulesByIds,
  getPhonicsSymbolsByIds,
} from "@/db/repositories/phonics.repo";
import { LessonDetailPage } from "@/modules/practice-pinyin-zhuyin";

export default async function Page({
  params,
}: {
  params: Promise<{ scope: string; lessonId: string }>;
}) {
  const { scope, lessonId } = await params;
  if (scope !== "pinyin" && scope !== "zhuyin") notFound();

  const lesson = getPhonicsLesson(scope, lessonId);
  if (!lesson) notFound();

  const symbols = getPhonicsSymbolsByIds(lesson.symbolIds);
  const rules = getPhonicsRulesByIds(lesson.ruleIds);

  return <LessonDetailPage scope={scope} lesson={lesson} symbols={symbols} rules={rules} />;
}
