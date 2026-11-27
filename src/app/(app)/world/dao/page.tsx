export const instant = false;

import { listRoadmaps } from "@/db/repositories/roadmaps.repo";
import { DaoPage } from "@/modules/world";

export default async function Page() {
  const roadmaps = listRoadmaps();
  return <DaoPage roadmaps={roadmaps} />;
}
