"use client";

import dynamic from "next/dynamic";

const Playground = dynamic(
  () => import("@/components/playground").then((m) => m.Playground),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        <p className="text-sm">Loading playground...</p>
      </div>
    ),
  },
);

export function PlaygroundLoader() {
  return <Playground />;
}
