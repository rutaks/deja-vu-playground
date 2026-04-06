"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Share2, Check } from "lucide-react";
import type { ExpressionNode } from "@/lib/types";
import { buildScheduleConfig, isTreeValid } from "@/lib/schedule-builder";
import { encodeSchedule } from "@/lib/share";

interface JsonPreviewProps {
  nodes: ExpressionNode[];
}

function syntaxHighlight(json: string) {
  return json.split("\n").map((line, i) => {
    const highlighted = line
      .replace(/"([^"]+)":/g, '<span style="color:var(--expr-rose)">"$1"</span>:')
      .replace(/: "([^"]+)"/g, ': <span style="color:var(--expr-emerald)">"$1"</span>')
      .replace(/: (\d+)/g, ': <span style="color:var(--expr-amber)">$1</span>');
    return <div key={i} dangerouslySetInnerHTML={{ __html: highlighted }} />;
  });
}

export function JsonPreview({ nodes }: JsonPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const json = useMemo(() => {
    if (!isTreeValid(nodes)) return null;
    try {
      return JSON.stringify(buildScheduleConfig(nodes), null, 2);
    } catch {
      return null;
    }
  }, [nodes]);

  const handleCopy = async () => {
    if (!json) return;
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (nodes.length === 0) return;
    const encoded = encodeSchedule(nodes);
    const url = `${window.location.origin}${window.location.pathname}?s=${encoded}`;
    await navigator.clipboard.writeText(url);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div />
        <div className="flex gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground"
            onClick={handleCopy}
            disabled={!json}
          >
            {copied ? <Check className="w-3 h-3 text-expr-emerald" /> : <Copy className="w-3 h-3" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground"
            onClick={handleShare}
            disabled={nodes.length === 0}
          >
            {shared ? <Check className="w-3 h-3 text-expr-emerald" /> : <Share2 className="w-3 h-3" />}
          </Button>
        </div>
      </div>
      <div className="bg-muted rounded-md border border-border p-3 overflow-x-auto">
        {json ? (
          <pre className="font-mono text-[10px] leading-relaxed">
            {syntaxHighlight(json)}
          </pre>
        ) : (
          <p className="text-[10px] text-muted-foreground text-center py-4">
            {nodes.length === 0
              ? "Build a schedule to see JSON output"
              : "Complete configuration to generate JSON"}
          </p>
        )}
      </div>
    </div>
  );
}
