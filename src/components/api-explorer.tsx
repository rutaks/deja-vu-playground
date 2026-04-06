"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { ExpressionNode } from "@/lib/types";
import { buildScheduleConfig, isTreeValid } from "@/lib/schedule-builder";
import {
  Play,
  CalendarCheck,
  CalendarSearch,
  SkipForward,
  SkipBack,
} from "lucide-react";

interface ApiExplorerProps {
  nodes: ExpressionNode[];
}

type ApiMethod =
  | "isOccurring"
  | "slots"
  | "datesInRange"
  | "nextOccurrence"
  | "previousOccurrence";

interface MethodDef {
  id: ApiMethod;
  label: string;
  icon: React.ElementType;
  description: string;
}

const METHODS: MethodDef[] = [
  {
    id: "isOccurring",
    label: "isOccurring",
    icon: CalendarCheck,
    description: "Check if the schedule is active on a specific date",
  },
  {
    id: "slots",
    label: "slots",
    icon: CalendarCheck,
    description: "Get available slots for a specific date",
  },
  {
    id: "datesInRange",
    label: "datesInRange",
    icon: CalendarSearch,
    description: "Get all active dates within a range",
  },
  {
    id: "nextOccurrence",
    label: "nextOccurrence",
    icon: SkipForward,
    description: "Find the next scheduled date after a given date",
  },
  {
    id: "previousOccurrence",
    label: "previousOccurrence",
    icon: SkipBack,
    description: "Find the previous scheduled date before a given date",
  },
];

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function toInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function useSchedule(nodes: ExpressionNode[]) {
  return useMemo(() => {
    if (!isTreeValid(nodes)) return null;
    try {
      const config = buildScheduleConfig(nodes);
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { ScheduleJsonParser, BasicSchedule } = require("@rutaks/deja-vu");
      const elements = ScheduleJsonParser.parse(config);
      return BasicSchedule.of(elements);
    } catch {
      return null;
    }
  }, [nodes]);
}

export function ApiExplorer({ nodes }: ApiExplorerProps) {
  const schedule = useSchedule(nodes);
  const [activeMethod, setActiveMethod] = useState<ApiMethod>("isOccurring");
  const [date, setDate] = useState(() => toInputValue(new Date()));
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return toInputValue(d);
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);

  const runMethod = () => {
    if (!schedule) return;
    setError(null);
    setHasRun(true);

    try {
      const d = new Date(date + "T00:00:00");
      switch (activeMethod) {
        case "isOccurring":
          setResult(schedule.isOccurring(d));
          break;
        case "slots":
          setResult(schedule.slots(d));
          break;
        case "datesInRange": {
          const end = new Date(endDate + "T00:00:00");
          const dates = schedule.datesInRange(d, end);
          setResult(dates);
          break;
        }
        case "nextOccurrence":
          setResult(schedule.nextOccurrence(d));
          break;
        case "previousOccurrence":
          setResult(schedule.previousOccurrence(d));
          break;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "An error occurred");
      setResult(null);
    }
  };

  const renderResult = () => {
    if (error) {
      return (
        <div className="text-[10px] text-destructive bg-destructive/10 rounded-sm px-2 py-1.5">
          {error}
        </div>
      );
    }
    if (!hasRun) return null;
    if (result === null || result === undefined) {
      return (
        <div className="text-[10px] text-muted-foreground">No result</div>
      );
    }

    if (typeof result === "boolean") {
      return (
        <div
          className={`text-[10px] font-mono px-2 py-1.5 rounded-sm ${
            result
              ? "text-expr-emerald bg-expr-emerald/10"
              : "text-expr-rose bg-expr-rose/10"
          }`}
        >
          {String(result)}
        </div>
      );
    }

    if (typeof result === "number") {
      return (
        <div className="text-[10px] font-mono text-expr-amber bg-expr-amber/10 px-2 py-1.5 rounded-sm">
          {result} slot{result !== 1 ? "s" : ""}
        </div>
      );
    }

    if (result instanceof Date) {
      return (
        <div className="text-[10px] font-mono text-foreground bg-muted px-2 py-1.5 rounded-sm">
          {formatDate(result)}
        </div>
      );
    }

    if (Array.isArray(result)) {
      if (result.length === 0) {
        return (
          <div className="text-[10px] text-muted-foreground px-2 py-1.5">
            No dates found in range
          </div>
        );
      }
      return (
        <div className="max-h-[120px] overflow-y-auto">
          <div className="text-[10px] text-muted-foreground mb-1">
            {result.length} date{result.length !== 1 ? "s" : ""} found
          </div>
          <div className="flex flex-wrap gap-1">
            {result.slice(0, 50).map((d: Date, i: number) => (
              <span
                key={i}
                className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded-sm text-foreground"
              >
                {formatDate(d)}
              </span>
            ))}
            {result.length > 50 && (
              <span className="text-[10px] text-muted-foreground">
                +{result.length - 50} more
              </span>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="text-[10px] font-mono text-foreground bg-muted px-2 py-1.5 rounded-sm">
        {String(result)}
      </div>
    );
  };

  if (!schedule) {
    return (
      <div>
        <p className="text-[10px] text-muted-foreground text-center py-4">
          {nodes.length === 0
            ? "Build a schedule to explore the API"
            : "Complete the expression to explore the API"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1">
        {METHODS.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => {
                setActiveMethod(m.id);
                setHasRun(false);
                setResult(null);
                setError(null);
              }}
              className={`text-[10px] px-2 py-1 rounded-sm border transition-colors cursor-pointer flex items-center gap-1 ${
                activeMethod === m.id
                  ? "border-foreground/30 bg-foreground/5 text-foreground font-medium"
                  : "border-border bg-muted text-muted-foreground hover:text-foreground hover:border-foreground/20"
              }`}
            >
              <Icon className="w-3 h-3" />
              {m.label}
            </button>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground">
        {METHODS.find((m) => m.id === activeMethod)?.description}
      </p>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <label className="text-[10px] text-muted-foreground shrink-0">
            {activeMethod === "datesInRange" ? "Start:" : "Date:"}
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 bg-muted border border-border rounded-sm px-2 py-1 text-[10px] font-mono text-foreground outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        {activeMethod === "datesInRange" && (
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-muted-foreground shrink-0">
              End:
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 bg-muted border border-border rounded-sm px-2 py-1 text-[10px] font-mono text-foreground outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        )}
      </div>

      <Button
        variant="default"
        size="sm"
        className="h-7 text-[10px] gap-1 w-full"
        onClick={runMethod}
      >
        <Play className="w-3 h-3" /> Run
      </Button>

      {(hasRun || error) && (
        <div>
          <div className="text-[10px] text-muted-foreground mb-1">Result:</div>
          {renderResult()}
        </div>
      )}
    </div>
  );
}
