export const instant = false;

import { notFound } from "next/navigation";
import {
  getPhonicsExercisesByIds,
  getPhonicsLesson,
} from "@/db/repositories/phonics.repo";
import { SessionPage } from "@/modules/practice-pinyin-zhuyin";

export default async function Page({
  params,
}: {
  params: Promise<{ scope: string; lessonId: string }>;
}) {
  const { scope, lessonId } = await params;
  if (scope !== "pinyin" && scope !== "zhuyin") notFound();

  const lesson = getPhonicsLesson(scope, lessonId);
  if (!lesson) notFound();

  const exercises = getPhonicsExercisesByIds(lesson.exerciseIds);
  return <SessionPage scope={scope} lesson={lesson} exercises={exercises} mode="practice" />;
}
