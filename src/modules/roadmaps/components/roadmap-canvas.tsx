"use client";

import {
  Background,
  type Edge,
  type NodeMouseHandler,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import { Crosshair, Maximize2, Minus, Plus, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";
import type { RoadmapNodeVM } from "../types/roadmap";
import { type RoadmapFlowNode, RoadmapNode } from "./roadmap-node";

interface Props {
  nodes: RoadmapNodeVM[];
  edges: Array<{
    id: string;
    source: string;
    target: string;
    kind?: "main" | "branch";
  }>;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
}

const nodeTypes = { roadmap: RoadmapNode };

function CanvasControls({ selectedNodeId }: { selectedNodeId: string | null }) {
  const { zoomIn, zoomOut, fitView, setCenter, getNode } = useReactFlow();

  const handleFit = useCallback(() => {
    fitView({ padding: 0.2, duration: 300 });
  }, [fitView]);

  const handleReset = useCallback(() => {
    fitView({ padding: 0.2, duration: 300 });
  }, [fitView]);

  const handleCenter = useCallback(() => {
    if (!selectedNodeId) return;
    const node = getNode(selectedNodeId);
    if (!node) return;
    const x = node.position.x + (node.measured?.width ?? 240) / 2;
    const y = node.position.y + (node.measured?.height ?? 140) / 2;
    setCenter(x, y, { zoom: 1, duration: 300 });
  }, [getNode, selectedNodeId, setCenter]);

  return (
    <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
      <button
        type="button"
        onClick={() => zoomIn({ duration: 200 })}
        className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-sm"
        aria-label="Zoom in"
      >
        <Plus size={18} />
      </button>
      <button
        type="button"
        onClick={() => zoomOut({ duration: 200 })}
        className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-sm"
        aria-label="Zoom out"
      >
        <Minus size={18} />
      </button>
      <button
        type="button"
        onClick={handleFit}
        className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-sm"
        aria-label="Fit to screen"
      >
        <Maximize2 size={18} />
      </button>
      <button
        type="button"
        onClick={handleReset}
        className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-sm"
        aria-label="Reset view"
      >
        <RotateCcw size={18} />
      </button>
      <button
        type="button"
        onClick={handleCenter}
        disabled={!selectedNodeId}
        className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-sm disabled:opacity-45"
        aria-label="Center on selected node"
      >
        <Crosshair size={18} />
      </button>
    </div>
  );
}

function RoadmapCanvasInner({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
}: Props) {
  const { fitView } = useReactFlow();

  const rfNodes: RoadmapFlowNode[] = useMemo(
    () =>
      nodes.map((node) => ({
        id: node.id,
        type: "roadmap",
        position: node.position,
        data: { ...node, selectedNode: node.id === selectedNodeId },
        draggable: false,
        selectable: true,
      })),
    [nodes, selectedNodeId],
  );

  const rfEdges: Edge[] = useMemo(
    () =>
      edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: "smoothstep",
        animated: edge.kind === "branch",
        style: {
          stroke:
            edge.kind === "branch"
              ? "color-mix(in srgb, var(--primary) 45%, var(--line))"
              : "color-mix(in srgb, var(--muted) 45%, var(--line))",
          strokeWidth: 2,
        },
      })),
    [edges],
  );

  useEffect(() => {
    const t = setTimeout(() => {
      fitView({ padding: 0.2, duration: 250 });
    }, 50);
    return () => clearTimeout(t);
  }, [fitView]);

  const onNodeClick: NodeMouseHandler = useCallback(
    (_e, node) => onSelectNode(node.id),
    [onSelectNode],
  );

  return (
    <div className="relative h-[560px] w-full overflow-hidden rounded-2xl border border-[var(--line)] bg-[color:color-mix(in_srgb,var(--bg)_70%,var(--surface))] sm:h-[640px]">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={() => onSelectNode(null)}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.8}
        zoomOnScroll
        zoomOnPinch
        panOnDrag
        panOnScroll={false}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        proOptions={{ hideAttribution: true }}
        className="roadmap-flow"
      >
        <Background
          gap={24}
          size={1}
          color="color-mix(in srgb, var(--line) 75%, transparent)"
        />
        <CanvasControls selectedNodeId={selectedNodeId} />
      </ReactFlow>
    </div>
  );
}

export function RoadmapCanvas(props: Props) {
  return (
    <ReactFlowProvider>
      <RoadmapCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
