export const instant = false;

import { listWorldToneOptions } from "@/db/repositories/world.repo";
import { LessonPage } from "@/modules/world";

export default async function Page({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  const toneOptions = listWorldToneOptions();
  return <LessonPage categoryId={categoryId} toneOptions={toneOptions} />;
}
