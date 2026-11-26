"use client";

import type { WorldCategory } from "@/modules/world/constants/world";
import { WorldPage } from "./world-page";

export function WorldExplorerPage({
  categories,
}: {
  categories: WorldCategory[];
}) {
  return <WorldPage categories={categories} />;
}
