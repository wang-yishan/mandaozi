export const instant = false;

import { listRoadmaps } from "@/db/repositories/roadmaps.repo";
import { CompletePage } from "@/modules/world";

export default async function Page({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  const roadmaps = listRoadmaps();
  return <CompletePage categoryId={categoryId} roadmaps={roadmaps} />;
}
