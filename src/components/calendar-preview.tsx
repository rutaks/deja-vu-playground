"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MONTH_NAMES } from "@/lib/types";
import type { ExpressionNode } from "@/lib/types";
import { buildScheduleConfig, isTreeValid } from "@/lib/schedule-builder";

interface CalendarPreviewProps {
  nodes: ExpressionNode[];
}

const DAY_HEADERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function useScheduleChecker(nodes: ExpressionNode[]) {
  return useMemo(() => {
    if (!isTreeValid(nodes)) return null;
    try {
      const config = buildScheduleConfig(nodes);
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { ScheduleJsonParser, BasicSchedule } = require("@rutaks/deja-vu");
      const elements = ScheduleJsonParser.parse(config);
      const schedule = BasicSchedule.of(elements);
      return schedule;
    } catch (e) {
      console.error("Schedule build error:", e);
      return null;
    }
  }, [nodes]);
}

function MonthGrid({
  year,
  month,
  schedule,
}: {
  year: number;
  month: number;
  schedule: unknown;
}) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="mb-4">
      <h4 className="text-[10px] font-medium text-foreground mb-2">
        {MONTH_NAMES[month]} {year}
      </h4>
      <div className="grid grid-cols-7 gap-0">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="text-center text-[10px] text-muted-foreground/60 pb-1 font-mono">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;

          let highlighted = false;
          if (schedule) {
            try {
              const date = new Date(year, month, day);
              highlighted = (
                schedule as { isOccurring: (d: Date) => boolean }
              ).isOccurring(date);
            } catch {
              // ignore
            }
          }
          const isToday = isCurrentMonth && day === today.getDate();

          return (
            <div key={day} className="flex items-center justify-center py-0.5">
              <div
                className={`w-6 h-6 flex items-center justify-center rounded-sm text-[10px] font-mono transition-colors ${
                  highlighted
                    ? "bg-foreground text-primary-foreground font-medium"
                    : isToday
                      ? "ring-1 ring-foreground/30 text-foreground"
                      : "text-muted-foreground"
                }`}
              >
                {day}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CalendarPreview({ nodes }: CalendarPreviewProps) {
  const [startMonth, setStartMonth] = useState(() => {
    const now = new Date();
    return now.getMonth();
  });
  const [year, setYear] = useState(() => new Date().getFullYear());
  const schedule = useScheduleChecker(nodes);

  const prev = () => {
    if (startMonth === 0) {
      setStartMonth(11);
      setYear((y) => y - 1);
    } else {
      setStartMonth((m) => m - 1);
    }
  };

  const next = () => {
    if (startMonth >= 9) {
      setStartMonth(0);
      setYear((y) => y + 1);
    } else {
      setStartMonth((m) => m + 1);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={prev}>
          <ChevronLeft className="w-3 h-3" />
        </Button>
        <span className="text-[10px] text-muted-foreground font-medium">Today</span>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={next}>
          <ChevronRight className="w-3 h-3" />
        </Button>
      </div>
      {!schedule && nodes.length > 0 && (
        <p className="text-[10px] text-muted-foreground text-center py-2 mb-2">
          Complete the expression to see preview
        </p>
      )}
      {[0, 1, 2].map((offset) => {
        let m = startMonth + offset;
        let y = year;
        if (m > 11) {
          m -= 12;
          y += 1;
        }
        return <MonthGrid key={`${y}-${m}`} year={y} month={m} schedule={schedule} />;
      })}
    </div>
  );
}
