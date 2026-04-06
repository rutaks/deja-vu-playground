import {
  type ExpressionNode,
  type DayInWeekConfig,
  type DayInMonthConfig,
  type RangeEveryYearConfig,
  ExpressionType,
} from "./types";

export function buildScheduleConfig(nodes: ExpressionNode[]): {
  schedule: Record<string, unknown>[];
} {
  return {
    schedule: nodes.map((node) => ({
      ...buildExpressionJson(node),
      slots: node.slots ?? 1,
    })),
  };
}

function buildExpressionJson(node: ExpressionNode): Record<string, unknown> {
  switch (node.type) {
    case ExpressionType.DAY_IN_WEEK: {
      const config = node.config as DayInWeekConfig;
      return {
        type: ExpressionType.DAY_IN_WEEK,
        day: String(config?.day ?? 1),
      };
    }
    case ExpressionType.DAY_IN_MONTH: {
      const config = node.config as DayInMonthConfig;
      return {
        type: ExpressionType.DAY_IN_MONTH,
        day: String(config?.day ?? 1),
        ordinal: config?.ordinal ?? 1,
      };
    }
    case ExpressionType.RANGE_EVERY_YEAR: {
      const config = node.config as RangeEveryYearConfig;
      if (config?.mode === "START_DAY_TO_END_DAY") {
        return {
          type: ExpressionType.RANGE_EVERY_YEAR,
          of: "START_DAY_TO_END_DAY",
          startDate: `${config.startMonth ?? 1}-${config.startDay ?? 1}`,
          endDate: `${config.endMonth ?? 12}-${config.endDay ?? 31}`,
        };
      }
      return {
        type: ExpressionType.RANGE_EVERY_YEAR,
        of: "START_MONTH_TO_END_MONTH",
        startMonth: String(config?.startMonth ?? 1),
        endMonth: String(config?.endMonth ?? 12),
      };
    }
    case ExpressionType.UNION:
    case ExpressionType.INTERSECTION:
      return {
        type: node.type,
        expressions: node.children.map(buildExpressionJson),
      };
    case ExpressionType.DIFFERENCE:
      return {
        type: ExpressionType.DIFFERENCE,
        includedDate: node.children[0]
          ? buildExpressionJson(node.children[0])
          : undefined,
        excludedDate: node.children[1]
          ? buildExpressionJson(node.children[1])
          : undefined,
      };
    default:
      return {};
  }
}

export function isNodeValid(node: ExpressionNode): boolean {
  if (
    node.type === ExpressionType.DAY_IN_WEEK ||
    node.type === ExpressionType.DAY_IN_MONTH ||
    node.type === ExpressionType.RANGE_EVERY_YEAR
  ) {
    return node.config !== null;
  }
  if (node.type === ExpressionType.UNION || node.type === ExpressionType.INTERSECTION) {
    return node.children.length >= 2 && node.children.every(isNodeValid);
  }
  if (node.type === ExpressionType.DIFFERENCE) {
    return node.children.length === 2 && node.children.every(isNodeValid);
  }
  return false;
}

export function isTreeValid(nodes: ExpressionNode[]): boolean {
  return nodes.length > 0 && nodes.every(isNodeValid);
}
