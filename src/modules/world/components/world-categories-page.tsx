"use client";

import type { RoadmapDef } from "@/modules/roadmaps/types/roadmap";
import type { WorldCategory } from "@/modules/world/constants/world";
import { CategoryPage } from "./world-page";

export function WorldCategoriesPage({
  categories,
  roadmaps = [],
}: {
  categories: WorldCategory[];
  roadmaps?: RoadmapDef[];
}) {
  return <CategoryPage categories={categories} roadmaps={roadmaps} />;
}
