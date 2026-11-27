import type { GuidedNodeInput, GuidedRecommendation } from "./types";

function normalizeStatus(status: GuidedNodeInput["status"]) {
  return status === "in-progress" ? "in_progress" : status;
}

function actionForNode(
  node: GuidedNodeInput,
): GuidedRecommendation["actionType"] {
  const status = normalizeStatus(node.status);
  if (status === "review_required") return "review";
  if (node.lessonKind === "assessment") return "assess";
  if (node.lessonKind === "practice") return "practice";
  return "learn";
}

function reasonForNode(node: GuidedNodeInput): string {
  const status = normalizeStatus(node.status);
  if (status === "review_required")
    return "Needs review to restore confidence/mastery.";
  if (status === "in_progress") return "Continue where you left off.";
  if (status === "available") return "Unlocked and ready as the next step.";
  if (status === "mastered") return "Mastered; review only if needed.";
  if (status === "completed") return "Completed; you can review this node.";
  return "Recommended next step.";
}

export function getGuidedRecommendation(
  nodes: GuidedNodeInput[],
): GuidedRecommendation | null {
  const byPriority: GuidedNodeInput[] = [...nodes].sort((a, b) => {
    const score = (n: GuidedNodeInput) => {
      const status = normalizeStatus(n.status);
      if (status === "review_required") return 500;
      if (status === "in_progress") return 400;
      if (status === "available" || status === "recommended") return 300;
      if (status === "completed") return 100;
      if (status === "mastered") return 90;
      return 0; // locked
    };
    const diff = score(b) - score(a);
    if (diff !== 0) return diff;
    // milestone proximity / earlier order as tie-breaker
    if (a.isMilestone !== b.isMilestone) return a.isMilestone ? -1 : 1;
    return a.order - b.order;
  });

  const candidate = byPriority.find((n) =>
    ["review_required", "in_progress", "available", "recommended"].includes(
      normalizeStatus(n.status),
    ),
  );
  if (!candidate) return null;

  return {
    nodeId: candidate.id,
    title: candidate.title,
    reason: reasonForNode(candidate),
    actionType: actionForNode(candidate),
    href: candidate.lessonHref,
    estimatedDuration: candidate.estimatedDuration,
  };
}
