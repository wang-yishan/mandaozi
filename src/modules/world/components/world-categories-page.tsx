"use client";

import type { WorldCategory } from "@/modules/world/constants/world";
import { CategoryPage } from "./world-page";

export function WorldCategoriesPage({
  categories,
}: {
  categories: WorldCategory[];
}) {
  return <CategoryPage categories={categories} />;
}
