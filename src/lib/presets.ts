import { type ExpressionNode, ExpressionType } from "./types";

export interface Preset {
  name: string;
  description: string;
  nodes: ExpressionNode[];
}

let id = 0;
const uid = () => `preset-${++id}`;

export const PRESETS: Preset[] = [
  {
    name: "Every Monday",
    description: "Simple weekly recurrence",
    nodes: [
      {
        id: uid(),
        type: ExpressionType.DAY_IN_WEEK,
        config: { day: 1 },
        children: [],
        slots: 1,
      },
    ],
  },
  {
    name: "Weekdays Only",
    description: "Monday through Friday using Union",
    nodes: [
      {
        id: uid(),
        type: ExpressionType.UNION,
        config: null,
        children: [
          { id: uid(), type: ExpressionType.DAY_IN_WEEK, config: { day: 1 }, children: [] },
          { id: uid(), type: ExpressionType.DAY_IN_WEEK, config: { day: 2 }, children: [] },
          { id: uid(), type: ExpressionType.DAY_IN_WEEK, config: { day: 3 }, children: [] },
          { id: uid(), type: ExpressionType.DAY_IN_WEEK, config: { day: 4 }, children: [] },
          { id: uid(), type: ExpressionType.DAY_IN_WEEK, config: { day: 5 }, children: [] },
        ],
        slots: 1,
      },
    ],
  },
  {
    name: "Summer Mondays",
    description: "Mondays in June-August (Intersection)",
    nodes: [
      {
        id: uid(),
        type: ExpressionType.INTERSECTION,
        config: null,
        children: [
          { id: uid(), type: ExpressionType.DAY_IN_WEEK, config: { day: 1 }, children: [] },
          {
            id: uid(),
            type: ExpressionType.RANGE_EVERY_YEAR,
            config: {
              mode: "START_MONTH_TO_END_MONTH",
              startMonth: 6,
              endMonth: 8,
            },
            children: [],
          },
        ],
        slots: 10,
      },
    ],
  },
  {
    name: "First Friday of Each Month",
    description: "Monthly recurrence with ordinal",
    nodes: [
      {
        id: uid(),
        type: ExpressionType.DAY_IN_MONTH,
        config: { day: 5, ordinal: 1 },
        children: [],
        slots: 1,
      },
    ],
  },
  {
    name: "Weekdays Except First Monday",
    description: "Difference: weekdays minus first Monday",
    nodes: [
      {
        id: uid(),
        type: ExpressionType.DIFFERENCE,
        config: null,
        children: [
          {
            id: uid(),
            type: ExpressionType.UNION,
            config: null,
            children: [
              { id: uid(), type: ExpressionType.DAY_IN_WEEK, config: { day: 1 }, children: [] },
              { id: uid(), type: ExpressionType.DAY_IN_WEEK, config: { day: 2 }, children: [] },
              { id: uid(), type: ExpressionType.DAY_IN_WEEK, config: { day: 3 }, children: [] },
              { id: uid(), type: ExpressionType.DAY_IN_WEEK, config: { day: 4 }, children: [] },
              { id: uid(), type: ExpressionType.DAY_IN_WEEK, config: { day: 5 }, children: [] },
            ],
          },
          {
            id: uid(),
            type: ExpressionType.DAY_IN_MONTH,
            config: { day: 1, ordinal: 1 },
            children: [],
          },
        ],
        slots: 5,
      },
    ],
  },
];
