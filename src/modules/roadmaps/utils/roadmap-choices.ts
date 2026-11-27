import type {
  RoadmapChoiceSelection,
  RoadmapDef,
  RoadmapNodeChoice,
  RoadmapNodeDef,
} from "../types/roadmap";

export function getNodeSelection(
  selection: RoadmapChoiceSelection | null | undefined,
  nodeId: string,
): string | null {
  const value = selection?.[nodeId];
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function getSelectedChoice(
  node: RoadmapNodeDef,
  selection: RoadmapChoiceSelection | null | undefined,
): RoadmapNodeChoice | null {
  const choiceId = getNodeSelection(selection, node.id);
  if (!choiceId || !node.choices?.length) return null;
  return node.choices.find((c) => c.id === choiceId) ?? null;
}

/**
 * Varian Node untuk rendering Dao. Tidak mengubah node asli/roadmap diagram.
 */
export function applyNodeVariant(
  node: RoadmapNodeDef,
  selection: RoadmapChoiceSelection | null | undefined,
): RoadmapNodeDef {
  const choice = getSelectedChoice(node, selection);
  const variant = choice?.variant;
  if (!variant) return node;

  const lessonInfo =
    variant.lessonInfo !== undefined
      ? node.lessonInfo || variant.lessonInfo.label || variant.lessonInfo.kind
        ? {
            label:
              variant.lessonInfo.label ?? node.lessonInfo?.label ?? node.title,
            kind: variant.lessonInfo.kind ?? node.lessonInfo?.kind ?? "lesson",
            ...(variant.lessonInfo.href !== undefined
              ? { href: variant.lessonInfo.href }
              : node.lessonInfo?.href
                ? { href: node.lessonInfo.href }
                : {}),
          }
        : node.lessonInfo
      : node.lessonInfo;

  return {
    ...node,
    ...(variant.title !== undefined ? { title: variant.title } : {}),
    ...(variant.description !== undefined
      ? { description: variant.description }
      : {}),
    ...(variant.estimatedDuration !== undefined
      ? { estimatedDuration: variant.estimatedDuration }
      : {}),
    ...(lessonInfo !== undefined ? { lessonInfo } : {}),
  };
}

function hasCondition(choice: RoadmapNodeChoice): boolean {
  return (
    (choice.includesNodeIds?.length ?? 0) > 0 ||
    (choice.excludesNodeIds?.length ?? 0) > 0 ||
    (choice.nextNodeIds?.length ?? 0) > 0
  );
}

/**
 * Hitung set node aktif untuk Dao. TIDAK memfilter roadmap diagram.
 */
export function getDaoActiveNodeIds(
  roadmap: RoadmapDef,
  selection: RoadmapChoiceSelection | null | undefined,
): Set<string> {
  const allIds = new Set(roadmap.nodes.map((n) => n.id));
  const active = new Set(allIds);

  const selectedChoices: Array<{ nodeId: string; choice: RoadmapNodeChoice }> =
    [];
  for (const node of roadmap.nodes) {
    const choice = getSelectedChoice(node, selection);
    if (choice) selectedChoices.push({ nodeId: node.id, choice });
  }

  const includeSources: string[] = [];
  const includeIds: string[] = [];
  const nextIds: string[] = [];
  const excludeIds: string[] = [];

  for (const { nodeId, choice } of selectedChoices) {
    if ((choice.includesNodeIds?.length ?? 0) > 0) {
      includeSources.push(nodeId);
      for (const id of choice.includesNodeIds ?? []) includeIds.push(id);
    }
    for (const id of choice.nextNodeIds ?? []) nextIds.push(id);
    for (const id of choice.excludesNodeIds ?? []) excludeIds.push(id);
  }

  if (includeIds.length > 0) {
    // includesNodeIds membatasi Dao ke node tertentu (+ source + next).
    // Prerequisite yang hilang akan dipangkas oleh buildDaoRoadmap agar tidak memblokir.
    active.clear();
    for (const id of includeSources) if (allIds.has(id)) active.add(id);
    for (const id of includeIds) if (allIds.has(id)) active.add(id);
    for (const id of nextIds) if (allIds.has(id)) active.add(id);
  } else {
    for (const id of nextIds) if (allIds.has(id)) active.add(id);
  }

  for (const id of excludeIds) {
    if (allIds.has(id)) active.delete(id);
  }

  return active;
}

/**
 * Build roadmap terfilter untuk DAO saja. Roadmap asli/diagram tidak berubah.
 * - nodes: urutan roadmap.nodes dipertahankan, prerequisiteIds dipangkas ke node aktif
 * - edges: hanya edge antar node aktif
 */
export function buildDaoRoadmap(
  roadmap: RoadmapDef,
  selection: RoadmapChoiceSelection | null | undefined,
): RoadmapDef {
  const activeIds = getDaoActiveNodeIds(roadmap, selection);

  const nodes = roadmap.nodes
    .filter((node) => activeIds.has(node.id))
    .map((node) => ({
      ...node,
      prerequisiteIds: node.prerequisiteIds.filter((id) => activeIds.has(id)),
    }));

  const edges = roadmap.edges.filter(
    (edge) => activeIds.has(edge.source) && activeIds.has(edge.target),
  );

  return {
    ...roadmap,
    nodes,
    edges,
  };
}

export function hasAnyChoiceCondition(
  roadmap: RoadmapDef,
  selection: RoadmapChoiceSelection | null | undefined,
): boolean {
  for (const node of roadmap.nodes) {
    const choice = getSelectedChoice(node, selection);
    if (choice && hasCondition(choice)) return true;
  }
  return false;
}
