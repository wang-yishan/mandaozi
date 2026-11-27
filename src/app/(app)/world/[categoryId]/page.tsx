export const instant = false;

import { listRoadmaps } from "@/db/repositories/roadmaps.repo";
import { listWorldCategories } from "@/db/repositories/world.repo";
import { CategoryPage } from "@/modules/world";

export default async function Page({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  const [categories, roadmaps] = [listWorldCategories(), listRoadmaps()];
  return (
    <CategoryPage
      categoryId={categoryId}
      categories={categories}
      roadmaps={roadmaps}
    />
  );
}
