export interface MasteryHrefContext {
  roadmapId?: string;
  nodeId?: string;
  choiceNodeId?: string;
  choiceId?: string;
  returnTo?: string;
}

export function buildMasteryHref(
  learningItemId: string,
  ctx: MasteryHrefContext = {},
): string {
  const base = `/mastery/${encodeURIComponent(learningItemId)}`;
  const params = new URLSearchParams();
  if (ctx.roadmapId) params.set("roadmapId", ctx.roadmapId);
  if (ctx.nodeId) params.set("nodeId", ctx.nodeId);
  if (ctx.choiceNodeId) params.set("choiceNodeId", ctx.choiceNodeId);
  if (ctx.choiceId) params.set("choiceId", ctx.choiceId);
  if (ctx.returnTo && ctx.returnTo.startsWith("/")) {
    params.set("returnTo", ctx.returnTo);
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function fallbackLearningItemIdForNode(nodeId: string): string {
  return `li:node:${nodeId}`;
}
