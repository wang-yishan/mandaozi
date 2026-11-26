export const instant = false;

import { notFound } from "next/navigation";
import { listPhonicsLessonsByScope } from "@/db/repositories/phonics.repo";
import { ScopePage } from "@/modules/practice-pinyin-zhuyin";

export default async function Page({
  params,
}: {
  params: Promise<{ scope: string }>;
}) {
  const { scope } = await params;
  if (scope !== "pinyin" && scope !== "zhuyin") notFound();
  const lessons = listPhonicsLessonsByScope(scope);
  return <ScopePage scope={scope} lessons={lessons} />;
}
