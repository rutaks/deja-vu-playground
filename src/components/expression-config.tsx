"use client";

import {
  type ExpressionNode,
  type DayInWeekConfig,
  type DayInMonthConfig,
  type RangeEveryYearConfig,
  ExpressionType,
  DAY_NAMES,
  MONTH_NAMES,
  ORDINAL_NAMES,
} from "@/lib/types";

interface Props {
  node: ExpressionNode;
  onChange: (config: ExpressionNode["config"]) => void;
}

function SelectInline({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-muted border border-border rounded-sm px-1.5 py-0.5 text-[10px] font-mono text-foreground outline-none focus:ring-1 focus:ring-ring cursor-pointer"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function ExpressionConfig({ node, onChange }: Props) {
  switch (node.type) {
    case ExpressionType.DAY_IN_WEEK:
      return (
        <DayInWeekForm
          config={node.config as DayInWeekConfig | null}
          onChange={onChange}
        />
      );
    case ExpressionType.DAY_IN_MONTH:
      return (
        <DayInMonthForm
          config={node.config as DayInMonthConfig | null}
          onChange={onChange}
        />
      );
    case ExpressionType.RANGE_EVERY_YEAR:
      return (
        <RangeEveryYearForm
          config={node.config as RangeEveryYearConfig | null}
          onChange={onChange}
        />
      );
    default:
      return null;
  }
}

function DayInWeekForm({
  config,
  onChange,
}: {
  config: DayInWeekConfig | null;
  onChange: (c: DayInWeekConfig) => void;
}) {
  const dayOptions = DAY_NAMES.map((name, i) => ({ value: String(i), label: name }));
  return (
    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1.5">
      Every{" "}
      <SelectInline
        value={String(config?.day ?? 1)}
        options={dayOptions}
        onChange={(v) => onChange({ day: parseInt(v) })}
      />
    </div>
  );
}

function DayInMonthForm({
  config,
  onChange,
}: {
  config: DayInMonthConfig | null;
  onChange: (c: DayInMonthConfig) => void;
}) {
  const current = { day: config?.day ?? 1, ordinal: config?.ordinal ?? 1 };
  const ordinalOptions = Object.entries(ORDINAL_NAMES).map(([val, name]) => ({
    value: val,
    label: name,
  }));
  const dayOptions = DAY_NAMES.map((name, i) => ({ value: String(i), label: name }));

  return (
    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1.5 flex-wrap">
      <SelectInline
        value={String(current.ordinal)}
        options={ordinalOptions}
        onChange={(v) => onChange({ ...current, ordinal: parseInt(v) })}
      />
      <SelectInline
        value={String(current.day)}
        options={dayOptions}
        onChange={(v) => onChange({ ...current, day: parseInt(v) })}
      />
      <span>of each month</span>
    </div>
  );
}

function RangeEveryYearForm({
  config,
  onChange,
}: {
  config: RangeEveryYearConfig | null;
  onChange: (c: RangeEveryYearConfig) => void;
}) {
  const current: RangeEveryYearConfig = config ?? {
    mode: "START_MONTH_TO_END_MONTH",
    startMonth: 1,
    endMonth: 12,
  };
  const monthOptions = MONTH_NAMES.map((name, i) => ({
    value: String(i + 1),
    label: name,
  }));

  return (
    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1.5 flex-wrap">
      <SelectInline
        value={String(current.startMonth)}
        options={monthOptions}
        onChange={(v) => onChange({ ...current, startMonth: parseInt(v) })}
      />
      <span>to</span>
      <SelectInline
        value={String(current.endMonth)}
        options={monthOptions}
        onChange={(v) => onChange({ ...current, endMonth: parseInt(v) })}
      />
    </div>
  );
}
