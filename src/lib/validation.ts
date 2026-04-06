import { type ExpressionNode, ExpressionType } from "./types";

export interface ValidationError {
  nodeId: string;
  message: string;
}

const COMPOSITE_TYPES = new Set([
  ExpressionType.UNION,
  ExpressionType.INTERSECTION,
  ExpressionType.DIFFERENCE,
]);

export function validateNode(node: ExpressionNode): ValidationError[] {
  const errors: ValidationError[] = [];

  if (COMPOSITE_TYPES.has(node.type)) {
    if (node.type === ExpressionType.DIFFERENCE) {
      if (node.children.length < 2) {
        errors.push({
          nodeId: node.id,
          message: `Difference needs exactly 2 children: a base schedule and an exclusion. Currently has ${node.children.length}.`,
        });
      } else if (node.children.length > 2) {
        errors.push({
          nodeId: node.id,
          message: `Difference accepts exactly 2 children, but has ${node.children.length}. Remove ${node.children.length - 2}.`,
        });
      }
    } else {
      if (node.children.length < 2) {
        errors.push({
          nodeId: node.id,
          message: `${node.type === ExpressionType.UNION ? "Union" : "Intersection"} needs at least 2 children. Currently has ${node.children.length}.`,
        });
      }
    }

    for (const child of node.children) {
      errors.push(...validateNode(child));
    }
  } else {
    if (node.config === null) {
      errors.push({
        nodeId: node.id,
        message: "Expression is missing configuration.",
      });
    }
  }

  return errors;
}

export function validateTree(nodes: ExpressionNode[]): ValidationError[] {
  const errors: ValidationError[] = [];
  for (const node of nodes) {
    errors.push(...validateNode(node));
  }
  return errors;
}

export function getNodeErrors(
  nodeId: string,
  errors: ValidationError[],
): ValidationError[] {
  return errors.filter((e) => e.nodeId === nodeId);
}

export function canAcceptChild(
  parent: ExpressionNode,
): { allowed: boolean; reason?: string } {
  if (!COMPOSITE_TYPES.has(parent.type)) {
    return { allowed: false, reason: "Only composite expressions accept children." };
  }

  if (parent.type === ExpressionType.DIFFERENCE && parent.children.length >= 2) {
    return {
      allowed: false,
      reason: "Difference already has 2 children (base + exclusion).",
    };
  }

  return { allowed: true };
}

export function getDropHint(parent: ExpressionNode): string | null {
  if (parent.type === ExpressionType.DIFFERENCE) {
    if (parent.children.length === 0) return "Drop the base schedule (included dates)";
    if (parent.children.length === 1) return "Drop the exclusion schedule (dates to remove)";
    return null;
  }
  if (
    parent.type === ExpressionType.UNION ||
    parent.type === ExpressionType.INTERSECTION
  ) {
    if (parent.children.length === 0) return "Drop at least 2 expressions";
    if (parent.children.length === 1) return "Drop at least 1 more expression";
    return "Drop more expressions or configure existing ones";
  }
  return null;
}
