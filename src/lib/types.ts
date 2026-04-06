export enum ExpressionType {
  DAY_IN_WEEK = "DAY_IN_WEEK",
  DAY_IN_MONTH = "DAY_IN_MONTH",
  RANGE_EVERY_YEAR = "RANGE_EVERY_YEAR",
  UNION = "UNION",
  INTERSECTION = "INTERSECTION",
  DIFFERENCE = "DIFFERENCE",
}

export interface DayInWeekConfig {
  day: number; // 0-6 (0=Sunday)
}

export interface DayInMonthConfig {
  day: number; // 0-6
  ordinal: number; // 1-5 or -1 to -5
}

export interface RangeEveryYearConfig {
  mode: "START_DAY_TO_END_DAY" | "START_MONTH_TO_END_MONTH";
  startMonth: number;
  endMonth: number;
  startDay?: number;
  endDay?: number;
}

export type ExpressionConfig =
  | DayInWeekConfig
  | DayInMonthConfig
  | RangeEveryYearConfig;

export interface ExpressionNode {
  id: string;
  type: ExpressionType;
  config: ExpressionConfig | null;
  children: ExpressionNode[];
  slots?: number;
}

export interface PaletteItem {
  type: ExpressionType;
  label: string;
  description: string;
  isComposite: boolean;
}

export const PALETTE_ITEMS: PaletteItem[] = [
  {
    type: ExpressionType.DAY_IN_WEEK,
    label: "Day in Week",
    description: "Every specific weekday",
    isComposite: false,
  },
  {
    type: ExpressionType.DAY_IN_MONTH,
    label: "Day in Month",
    description: "Nth weekday of month",
    isComposite: false,
  },
  {
    type: ExpressionType.RANGE_EVERY_YEAR,
    label: "Range / Year",
    description: "Date range each year",
    isComposite: false,
  },
  {
    type: ExpressionType.UNION,
    label: "Union (OR)",
    description: "Any of the schedules",
    isComposite: true,
  },
  {
    type: ExpressionType.INTERSECTION,
    label: "Intersection (AND)",
    description: "All schedules overlap",
    isComposite: true,
  },
  {
    type: ExpressionType.DIFFERENCE,
    label: "Difference (NOT)",
    description: "Exclude from schedule",
    isComposite: true,
  },
];

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const ORDINAL_NAMES: Record<number, string> = {
  1: "First",
  2: "Second",
  3: "Third",
  4: "Fourth",
  5: "Fifth",
  [-1]: "Last",
  [-2]: "Second to last",
  [-3]: "Third to last",
};
