export const instant = false;

import { listRoadmaps } from "@/db/repositories/roadmaps.repo";
import { listWorldCategories } from "@/db/repositories/world.repo";
import { WorldCategoriesPage } from "@/modules/world";

export default async function Page() {
  const [categories, roadmaps] = await Promise.all([listWorldCategories(), listRoadmaps()]);
  return <WorldCategoriesPage categories={categories} roadmaps={roadmaps} />;
}
