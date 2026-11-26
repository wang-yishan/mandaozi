export const instant = false;

import { listWorldCategories } from "@/db/repositories/world.repo";
import { WorldExplorerPage } from "@/modules/world";

export default async function Page() {
  const categories = listWorldCategories();
  return <WorldExplorerPage categories={categories} />;
}
