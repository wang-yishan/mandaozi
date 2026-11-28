export const instant = false;

import { listWorldCategories } from "@/db/repositories/world.repo";
import { WorldProgressPage } from "@/modules/world";

export default async function Page() {
  const categories = await listWorldCategories();
  return <WorldProgressPage categories={categories} />;
}
