"use client";

import {
  Calendar,
  CalendarDays,
  CalendarRange,
  GitMerge,
  Target,
  MinusCircle,
  GripVertical,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from "@/components/ui/popover";
import { useDraggable } from "@dnd-kit/core";
import { PRESETS } from "@/lib/presets";
import { ExpressionType, type ExpressionNode } from "@/lib/types";

export interface ExpressionDef {
  id: ExpressionType;
  label: string;
  subtitle: string;
  icon: React.ElementType;
  accent: string;
  accentBorder: string;
  composite?: boolean;
  help: {
    description: string;
    whenToUse: string;
    example: string;
    accepts?: string;
  };
}

export const EXPRESSIONS: ExpressionDef[] = [
  {
    id: ExpressionType.DAY_IN_WEEK,
    label: "Day in Week",
    subtitle: "Every specific weekday",
    icon: Calendar,
    accent: "text-expr-blue",
    accentBorder: "border-l-expr-blue",
    help: {
      description: "Matches every occurrence of a specific day of the week.",
      whenToUse: "When you need a simple weekly recurrence, like a class that happens every Wednesday.",
      example: "\"Every Monday\" matches all Mondays in any month or year.",
    },
  },
  {
    id: ExpressionType.DAY_IN_MONTH,
    label: "Day in Month",
    subtitle: "Nth weekday of month",
    icon: CalendarDays,
    accent: "text-expr-violet",
    accentBorder: "border-l-expr-violet",
    help: {
      description: "Matches a specific weekday at a specific position in the month (e.g. the 1st Monday, the last Friday).",
      whenToUse: "For monthly patterns like team retros on the first Tuesday, or payroll on the last Friday.",
      example: "\"First Friday\" matches the first Friday of every month.",
    },
  },
  {
    id: ExpressionType.RANGE_EVERY_YEAR,
    label: "Range / Year",
    subtitle: "Date range each year",
    icon: CalendarRange,
    accent: "text-expr-amber",
    accentBorder: "border-l-expr-amber",
    help: {
      description: "Matches every day within a month range that repeats each year.",
      whenToUse: "To define seasonal windows, like summer break or a holiday period.",
      example: "\"June to August\" matches every day from June 1 through August 31, every year.",
    },
  },
  {
    id: ExpressionType.UNION,
    label: "Union (OR)",
    subtitle: "Combine schedules",
    icon: GitMerge,
    accent: "text-expr-emerald",
    accentBorder: "border-l-expr-emerald",
    composite: true,
    help: {
      description: "A date matches if it appears in ANY of the child expressions. Think of it as combining multiple schedules together.",
      whenToUse: "When you want multiple patterns to all count, like availability on Mondays OR Wednesdays.",
      example: "Union of \"Monday\" + \"Wednesday\" matches all Mondays and all Wednesdays.",
      accepts: "2 or more expressions of any type.",
    },
  },
  {
    id: ExpressionType.INTERSECTION,
    label: "Intersection (AND)",
    subtitle: "Overlapping dates",
    icon: Target,
    accent: "text-expr-rose",
    accentBorder: "border-l-expr-rose",
    composite: true,
    help: {
      description: "A date matches only if it appears in ALL child expressions. This narrows down results to where schedules overlap.",
      whenToUse: "To constrain a pattern to a specific period, like Mondays that fall in summer only.",
      example: "Intersection of \"Monday\" + \"June to August\" matches only Mondays during summer.",
      accepts: "2 or more expressions of any type. Be careful that children can actually overlap, or the result will be empty.",
    },
  },
  {
    id: ExpressionType.DIFFERENCE,
    label: "Difference (NOT)",
    subtitle: "Exclude dates",
    icon: MinusCircle,
    accent: "text-expr-orange",
    accentBorder: "border-l-expr-orange",
    composite: true,
    help: {
      description: "Takes a base schedule and removes dates that match a second schedule. The first child is the included set, the second is the excluded set.",
      whenToUse: "To carve out exceptions, like weekdays except the first Monday of the month.",
      example: "Difference of \"Weekdays\" minus \"First Monday\" gives all weekdays except the first Monday.",
      accepts: "Exactly 2 children: first is the base schedule, second is what to exclude.",
    },
  },
];

function DraggablePaletteItem({ expr }: { expr: ExpressionDef }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${expr.id}`,
    data: { type: expr.id, fromPalette: true },
  });
  const Icon = expr.icon;

  return (
    <div className="flex items-center gap-1">
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className={`group flex items-center gap-2.5 px-2 py-2.5 rounded-md border border-border ${expr.accentBorder} border-l-[3px] bg-card hover:bg-accent cursor-grab active:cursor-grabbing transition-all duration-150 hover:shadow-sm hover:-translate-y-px flex-1 min-w-0 ${isDragging ? "opacity-50 scale-95" : ""}`}
      >
        <GripVertical className="w-3 h-3 text-muted-foreground/40 shrink-0" />
        <Icon className={`w-4 h-4 shrink-0 ${expr.accent}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-foreground truncate">{expr.label}</span>
            {expr.composite && (
              <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 font-normal">
                Composite
              </Badge>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">{expr.subtitle}</p>
        </div>
      </div>
      <Popover>
        <PopoverTrigger className="shrink-0 p-1 rounded-sm text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-pointer">
          <Info className="w-3.5 h-3.5" />
        </PopoverTrigger>
        <PopoverContent side="right" sideOffset={8} className="w-64">
          <PopoverHeader>
            <PopoverTitle className="text-xs flex items-center gap-1.5">
              <Icon className={`w-3.5 h-3.5 ${expr.accent}`} />
              {expr.label}
            </PopoverTitle>
          </PopoverHeader>
          <PopoverDescription className="text-[11px] leading-relaxed">
            {expr.help.description}
          </PopoverDescription>
          <div className="flex flex-col gap-2 mt-1">
            <div>
              <p className="text-[10px] font-medium text-foreground mb-0.5">When to use</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{expr.help.whenToUse}</p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-foreground mb-0.5">Example</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed italic">{expr.help.example}</p>
            </div>
            {expr.help.accepts && (
              <div>
                <p className="text-[10px] font-medium text-foreground mb-0.5">Accepts</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{expr.help.accepts}</p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface PaletteProps {
  onLoadPreset: (nodes: ExpressionNode[]) => void;
}

export function Palette({ onLoadPreset }: PaletteProps) {
  const handlePreset = (preset: typeof PRESETS[number]) => {
    const cloned = JSON.parse(JSON.stringify(preset.nodes));
    let counter = 0;
    const refreshIds = (ns: ExpressionNode[]): ExpressionNode[] =>
      ns.map((n) => ({
        ...n,
        id: `node-${Date.now()}-${counter++}`,
        children: refreshIds(n.children),
      }));
    onLoadPreset(refreshIds(cloned));
  };

  return (
    <aside className="w-[260px] border-r border-border bg-card flex flex-col shrink-0 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase mb-3">
          Expressions
        </h2>
        <div className="flex flex-col gap-1.5">
          {EXPRESSIONS.map((expr) => (
            <DraggablePaletteItem key={expr.id} expr={expr} />
          ))}
        </div>
      </div>

      <Separator />

      <div className="p-4">
        <h2 className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase mb-3">
          Presets
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => handlePreset(p)}
              className="text-[10px] px-2 py-1 rounded-sm border border-border bg-muted text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors cursor-pointer"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
