export const instant = false;

import { getDefaultRoadmapId, listRoadmaps } from "@/db/repositories/roadmaps.repo";
import { RoadmapsPage } from "@/modules/roadmaps";

export default async function Page() {
  const [roadmaps, defaultRoadmapId] = [listRoadmaps(), getDefaultRoadmapId()];
  return <RoadmapsPage roadmaps={roadmaps} defaultRoadmapId={defaultRoadmapId} />;
}
