"use client";

import { type ExpressionNode, ExpressionType } from "@/lib/types";
import { ExpressionConfig } from "./expression-config";
import { Badge } from "@/components/ui/badge";
import { EXPRESSIONS } from "./palette";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { X, ChevronDown, ChevronRight, GripVertical, AlertCircle } from "lucide-react";
import { useState } from "react";
import {
  type ValidationError,
  getNodeErrors,
  canAcceptChild,
  getDropHint,
} from "@/lib/validation";

const COMPOSITE_TYPES = new Set([ExpressionType.UNION, ExpressionType.INTERSECTION, ExpressionType.DIFFERENCE]);

interface TreeProps {
  nodes: ExpressionNode[];
  onUpdate: (nodes: ExpressionNode[]) => void;
  depth?: number;
  parentId?: string;
  errors?: ValidationError[];
}

export function ExpressionTree({ nodes, onUpdate, depth = 0, parentId, errors = [] }: TreeProps) {
  const removeNode = (id: string) => {
    onUpdate(nodes.filter((n) => n.id !== id));
  };

  const updateNode = (id: string, updated: Partial<ExpressionNode>) => {
    onUpdate(nodes.map((n) => (n.id === id ? { ...n, ...updated } : n)));
  };

  const updateNodeChildren = (id: string, children: ExpressionNode[]) => {
    onUpdate(nodes.map((n) => (n.id === id ? { ...n, children } : n)));
  };

  return (
    <div className="flex flex-col gap-1.5">
      {nodes.map((node, index) => (
        <ExpressionNodeCard
          key={node.id}
          node={node}
          depth={depth}
          index={index}
          parentId={parentId}
          errors={errors}
          onRemove={() => removeNode(node.id)}
          onUpdateConfig={(config) => updateNode(node.id, { config })}
          onUpdateSlots={(slots) => updateNode(node.id, { slots })}
          onUpdateChildren={(children) => updateNodeChildren(node.id, children)}
        />
      ))}
    </div>
  );
}

interface NodeCardProps {
  node: ExpressionNode;
  depth: number;
  index: number;
  parentId?: string;
  errors: ValidationError[];
  onRemove: () => void;
  onUpdateConfig: (config: ExpressionNode["config"]) => void;
  onUpdateSlots: (slots: number) => void;
  onUpdateChildren: (children: ExpressionNode[]) => void;
}

function ExpressionNodeCard({
  node,
  depth,
  index,
  parentId,
  errors,
  onRemove,
  onUpdateConfig,
  onUpdateSlots,
  onUpdateChildren,
}: NodeCardProps) {
  const [expanded, setExpanded] = useState(true);
  const isComposite = COMPOSITE_TYPES.has(node.type);
  const expr = EXPRESSIONS.find((e) => e.id === node.type);
  const nodeErrors = getNodeErrors(node.id, errors);
  const hasError = nodeErrors.length > 0;

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop-${node.id}`,
    data: { parentId: node.id, accepts: isComposite && canAcceptChild(node).allowed },
    disabled: !isComposite || !canAcceptChild(node).allowed,
  });

  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: `tree-${node.id}`,
    data: { type: node.type, fromPalette: false, nodeId: node.id, parentId, index },
  });

  if (!expr) return null;
  const Icon = expr.icon;

  const dropHint = isComposite ? getDropHint(node) : null;
  const acceptStatus = isComposite ? canAcceptChild(node) : null;

  return (
    <div
      ref={setDragRef}
      className={`rounded-md border ${hasError ? "border-destructive/50" : "border-border"} ${expr.accentBorder} border-l-[3px] bg-card ${isOver ? "ring-2 ring-ring/30" : ""} ${isDragging ? "opacity-40" : ""}`}
    >
      <div className="flex items-start justify-between px-3 py-2.5">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing transition-colors"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
          {isComposite && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-0.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          )}
          <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${expr.accent}`} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs text-foreground">{expr.label}</span>
              {isComposite && (
                <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 font-normal">
                  Composite
                </Badge>
              )}
              {node.type === ExpressionType.DIFFERENCE && node.children.length > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 font-normal font-mono">
                  {node.children.length}/2
                </Badge>
              )}
            </div>
            {!isComposite && (
              <ExpressionConfig node={node} onChange={onUpdateConfig} />
            )}
            {hasError && (
              <div className="flex items-start gap-1 mt-1.5">
                <AlertCircle className="w-3 h-3 text-destructive shrink-0 mt-0.5" />
                <span className="text-[10px] text-destructive">
                  {nodeErrors[0].message}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {depth === 0 && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span>Slots:</span>
              <input
                type="number"
                min={1}
                value={node.slots ?? 1}
                onChange={(e) =>
                  onUpdateSlots(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-10 bg-muted border border-border rounded-sm px-1 py-0.5 text-[10px] font-mono text-foreground text-center outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          )}
          <button
            className="text-muted-foreground/50 hover:text-destructive transition-colors"
            onClick={onRemove}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isComposite && expanded && (
        <div
          ref={setDropRef}
          className={`mx-3 mb-3 mt-0.5 border border-dashed ${hasError ? "border-destructive/30" : "border-border"} rounded-md p-2 flex flex-col gap-1.5`}
        >
          {node.children.length > 0 ? (
            <>
              {node.type === ExpressionType.DIFFERENCE && (
                <div className="flex flex-col gap-1.5">
                  {node.children.map((child, i) => (
                    <div key={child.id}>
                      <div className="text-[10px] text-muted-foreground font-medium mb-1 px-1">
                        {i === 0 ? "Include (base schedule):" : "Exclude (dates to remove):"}
                      </div>
                      <ExpressionTree
                        nodes={[child]}
                        onUpdate={(updated) => {
                          const newChildren = [...node.children];
                          if (updated.length === 0) {
                            newChildren.splice(i, 1);
                          } else {
                            newChildren[i] = updated[0];
                          }
                          onUpdateChildren(newChildren);
                        }}
                        depth={depth + 1}
                        parentId={node.id}
                        errors={errors}
                      />
                    </div>
                  ))}
                </div>
              )}
              {node.type !== ExpressionType.DIFFERENCE && (
                <ExpressionTree
                  nodes={node.children}
                  onUpdate={onUpdateChildren}
                  depth={depth + 1}
                  parentId={node.id}
                  errors={errors}
                />
              )}
              {acceptStatus && !acceptStatus.allowed && (
                <div className="text-[10px] text-muted-foreground/60 text-center py-1">
                  {acceptStatus.reason}
                </div>
              )}
            </>
          ) : (
            <div className="py-4 text-center border border-dashed border-border rounded-md drop-zone-pulse">
              <p className="text-[10px] text-muted-foreground">
                {dropHint || "Drop expressions here"}
              </p>
            </div>
          )}
          {node.children.length > 0 && acceptStatus?.allowed && dropHint && (
            <div className="py-2 text-center text-[10px] text-muted-foreground/50 border border-dashed border-border rounded-md drop-zone-pulse">
              {dropHint}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
