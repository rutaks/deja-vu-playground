"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { type ExpressionNode, ExpressionType } from "@/lib/types";
import { decodeSchedule } from "@/lib/share";
import { validateTree } from "@/lib/validation";
import { Header } from "./header";
import { Palette, EXPRESSIONS } from "./palette";
import { Canvas } from "./canvas";
import { CalendarPreview } from "./calendar-preview";
import { BottomPanel } from "./bottom-panel";
import { ScrollArea } from "@/components/ui/scroll-area";

function getDefaultConfig(type: ExpressionType) {
  switch (type) {
    case ExpressionType.DAY_IN_WEEK:
      return { day: 1 };
    case ExpressionType.DAY_IN_MONTH:
      return { day: 1, ordinal: 1 };
    case ExpressionType.RANGE_EVERY_YEAR:
      return {
        mode: "START_MONTH_TO_END_MONTH" as const,
        startMonth: 1,
        endMonth: 12,
      };
    default:
      return null;
  }
}

function createNode(type: ExpressionType): ExpressionNode {
  return {
    id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    config: getDefaultConfig(type),
    children: [],
    slots: 1,
  };
}

function addNodeToParent(
  nodes: ExpressionNode[],
  parentId: string,
  newNode: ExpressionNode,
): ExpressionNode[] {
  return nodes.map((node) => {
    if (node.id === parentId) {
      return { ...node, children: [...node.children, newNode] };
    }
    if (node.children.length > 0) {
      return {
        ...node,
        children: addNodeToParent(node.children, parentId, newNode),
      };
    }
    return node;
  });
}

function removeNodeById(
  nodes: ExpressionNode[],
  nodeId: string,
): ExpressionNode[] {
  return nodes
    .filter((n) => n.id !== nodeId)
    .map((n) => ({
      ...n,
      children: removeNodeById(n.children, nodeId),
    }));
}

function findNodeById(
  nodes: ExpressionNode[],
  nodeId: string,
): ExpressionNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) return node;
    const found = findNodeById(node.children, nodeId);
    if (found) return found;
  }
  return null;
}

function isDescendantOf(
  nodes: ExpressionNode[],
  nodeId: string,
  potentialAncestorId: string,
): boolean {
  const ancestor = findNodeById(nodes, potentialAncestorId);
  if (!ancestor) return false;
  return findNodeById(ancestor.children, nodeId) !== null;
}

export function Playground() {
  const [nodes, setNodes] = useState<ExpressionNode[]>([]);
  const [activeType, setActiveType] = useState<ExpressionType | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const errors = useMemo(() => validateTree(nodes), [nodes]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("s");
    if (encoded) {
      const decoded = decodeSchedule(encoded);
      if (decoded) setNodes(decoded);
    }
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.fromPalette) {
      setActiveType(data.type as ExpressionType);
    } else if (data?.nodeId) {
      setActiveDragId(data.nodeId as string);
      setActiveType(data.type as ExpressionType);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const data = active.data.current;

      if (data?.fromPalette) {
        setActiveType(null);
        if (!over) return;

        const type = data.type as ExpressionType;
        const newNode = createNode(type);
        const overData = over.data.current;

        if (over.id === "canvas-root") {
          setNodes((prev) => [...prev, newNode]);
        } else if (overData?.parentId && overData?.accepts) {
          setNodes((prev) =>
            addNodeToParent(prev, overData.parentId, newNode),
          );
        }
      } else if (data?.nodeId) {
        const nodeId = data.nodeId as string;
        setActiveType(null);
        setActiveDragId(null);
        if (!over) return;

        const overData = over.data.current;
        const targetId =
          over.id === "canvas-root" ? null : overData?.parentId;

        if (targetId === nodeId) return;
        if (targetId && isDescendantOf(nodes, targetId, nodeId)) return;

        const sourceParentId = data.parentId as string | undefined;
        if (targetId === (sourceParentId ?? null) && over.id !== "canvas-root")
          return;

        const movedNode = findNodeById(nodes, nodeId);
        if (!movedNode) return;

        setNodes((prev) => {
          const withoutNode = removeNodeById(prev, nodeId);
          if (over.id === "canvas-root") {
            return [...withoutNode, movedNode];
          } else if (targetId && overData?.accepts) {
            return addNodeToParent(withoutNode, targetId, movedNode);
          }
          return prev;
        });
      }
    },
    [nodes],
  );

  const handleDragCancel = useCallback(() => {
    setActiveType(null);
    setActiveDragId(null);
  }, []);

  const activeExpr = activeType
    ? EXPRESSIONS.find((e) => e.id === activeType)
    : null;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header nodes={nodes} />
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex flex-1 min-h-0">
          <Palette onLoadPreset={setNodes} />

          {/* Center: Canvas + Bottom Panel */}
          <div className="flex-1 flex flex-col min-w-0">
            <Canvas nodes={nodes} onUpdate={setNodes} errors={errors} />
            <BottomPanel nodes={nodes} />
          </div>

          {/* Right Panel: Calendar Preview (always visible) */}
          <aside className="w-[280px] border-l border-border bg-card flex flex-col shrink-0">
            <div className="h-10 flex items-center px-4 border-b border-border shrink-0">
              <h2 className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                Calendar Preview
              </h2>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4">
                <CalendarPreview nodes={nodes} />
              </div>
            </ScrollArea>
          </aside>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeExpr && (
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-md border border-border ${activeExpr.accentBorder} border-l-[3px] bg-card shadow-lg opacity-90`}
            >
              <activeExpr.icon
                className={`w-4 h-4 shrink-0 ${activeExpr.accent}`}
              />
              <span className="text-xs font-medium text-foreground">
                {activeExpr.label}
                {activeDragId && (
                  <span className="text-[10px] text-muted-foreground ml-1">(moving)</span>
                )}
              </span>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
