export const instant = false;

import { listWorldCategories } from "@/db/repositories/world.repo";
import { WorldCategoriesPage } from "@/modules/world";

export default async function Page() {
  const categories = listWorldCategories();
  return <WorldCategoriesPage categories={categories} />;
}
