"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Code2, Braces } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExpressionNode } from "@/lib/types";
import { JsonPreview } from "./json-preview";
import { ApiExplorer } from "./api-explorer";

interface BottomPanelProps {
  nodes: ExpressionNode[];
}

type PanelTab = "json" | "api";

export function BottomPanel({ nodes }: BottomPanelProps) {
  const [open, setOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<PanelTab>("api");

  return (
    <div
      className={`border-t border-border bg-card flex flex-col shrink-0 transition-all duration-200 ${
        open ? "h-[260px]" : "h-8"
      }`}
    >
      <div className="h-8 flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setActiveTab("api");
              if (!open) setOpen(true);
            }}
            className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-sm transition-colors cursor-pointer ${
              open && activeTab === "api"
                ? "text-foreground bg-muted font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code2 className="w-3 h-3" />
            API Explorer
          </button>
          <button
            onClick={() => {
              setActiveTab("json");
              if (!open) setOpen(true);
            }}
            className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-sm transition-colors cursor-pointer ${
              open && activeTab === "json"
                ? "text-foreground bg-muted font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Braces className="w-3 h-3" />
            JSON Config
          </button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground"
          onClick={() => setOpen(!open)}
        >
          {open ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </Button>
      </div>

      {open && (
        <div className="flex-1 overflow-auto px-3 pb-3">
          {activeTab === "json" && <JsonPreview nodes={nodes} />}
          {activeTab === "api" && <ApiExplorer nodes={nodes} />}
        </div>
      )}
    </div>
  );
}
