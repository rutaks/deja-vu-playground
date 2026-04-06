"use client";

import { useMemo } from "react";
import { type ExpressionNode } from "@/lib/types";
import { type ValidationError } from "@/lib/validation";
import { buildScheduleConfig, isTreeValid } from "@/lib/schedule-builder";
import { ExpressionTree } from "./expression-tree";
import { useDroppable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers, Trash2, AlertCircle, TriangleAlert } from "lucide-react";

interface CanvasProps {
  nodes: ExpressionNode[];
  onUpdate: (nodes: ExpressionNode[]) => void;
  errors: ValidationError[];
}

function useEmptyScheduleCheck(nodes: ExpressionNode[], hasStructuralErrors: boolean) {
  return useMemo(() => {
    if (hasStructuralErrors || !isTreeValid(nodes)) return null;
    try {
      const config = buildScheduleConfig(nodes);
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { ScheduleJsonParser, BasicSchedule } = require("@rutaks/deja-vu");
      const elements = ScheduleJsonParser.parse(config);
      const schedule = BasicSchedule.of(elements);
      const now = new Date();
      const futureDate = new Date(now);
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const dates = schedule.datesInRange(now, futureDate);
      return dates.length === 0;
    } catch {
      return null;
    }
  }, [nodes, hasStructuralErrors]);
}

function countExpressions(nodes: ExpressionNode[]): number {
  return nodes.reduce(
    (acc, n) => acc + 1 + countExpressions(n.children),
    0,
  );
}

export function Canvas({ nodes, onUpdate, errors }: CanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-root",
    data: { parentId: null, accepts: true },
  });
  const exprCount = countExpressions(nodes);
  const isEmpty = useEmptyScheduleCheck(nodes, errors.length > 0);

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-background">
      <div className="h-10 flex items-center justify-between px-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">Builder</span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal font-mono">
            {exprCount} expression{exprCount !== 1 ? "s" : ""}
          </Badge>
          {errors.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-destructive">
              <AlertCircle className="w-3 h-3" />
              <span>{errors.length} issue{errors.length !== 1 ? "s" : ""}</span>
            </div>
          )}
        </div>
        {nodes.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-destructive"
            onClick={() => onUpdate([])}
          >
            <Trash2 className="w-3 h-3" /> Clear All
          </Button>
        )}
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 overflow-auto dot-grid-bg p-6 ${isOver ? "bg-primary/5" : ""}`}
      >
        {nodes.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center mx-auto mb-4 drop-zone-pulse">
                <Layers className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <h3 className="text-[13px] font-medium text-muted-foreground mb-1">
                No expressions yet
              </h3>
              <p className="text-xs text-muted-foreground/70 max-w-[220px]">
                Drag expressions from the palette or load a preset
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto flex flex-col gap-3">
            {isEmpty && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-md border border-expr-amber/30 bg-expr-amber/5">
                <TriangleAlert className="w-4 h-4 text-expr-amber shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-foreground">No matching dates</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    This schedule produces no results in the next 12 months. The expressions may be logically contradictory (e.g. intersecting non-overlapping date ranges).
                  </p>
                </div>
              </div>
            )}
            <ExpressionTree nodes={nodes} onUpdate={onUpdate} errors={errors} />
          </div>
        )}
      </div>
    </div>
  );
}
