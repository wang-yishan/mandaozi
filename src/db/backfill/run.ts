import { db } from "../index";
import { runLegacyRoadmapBackfill } from "./legacy-roadmap-backfill";

const result = runLegacyRoadmapBackfill(db);
console.log(JSON.stringify(result, null, 2));
