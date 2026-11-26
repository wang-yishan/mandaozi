export const instant = false;

import { listWorldCategories } from "@/db/repositories/world.repo";
import { CategoryPage } from "@/modules/world";

export default async function Page({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  const categories = listWorldCategories();
  return <CategoryPage categoryId={categoryId} categories={categories} />;
}
