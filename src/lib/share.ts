import type { ExpressionNode } from "./types";

export function encodeSchedule(nodes: ExpressionNode[]): string {
  const json = JSON.stringify(nodes);
  if (typeof window !== "undefined") {
    return btoa(encodeURIComponent(json));
  }
  return Buffer.from(encodeURIComponent(json)).toString("base64");
}

export function decodeSchedule(encoded: string): ExpressionNode[] | null {
  try {
    let json: string;
    if (typeof window !== "undefined") {
      json = decodeURIComponent(atob(encoded));
    } else {
      json = decodeURIComponent(
        Buffer.from(encoded, "base64").toString(),
      );
    }
    return JSON.parse(json);
  } catch {
    return null;
  }
}
