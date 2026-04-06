"use client";

import { Clock, Sun, Moon, Share2, Check, ExternalLink, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import type { ExpressionNode } from "@/lib/types";
import { encodeSchedule } from "@/lib/share";

interface HeaderProps {
  nodes: ExpressionNode[];
}

export function Header({ nodes }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [shared, setShared] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleShare = async () => {
    if (nodes.length === 0) return;
    const encoded = encodeSchedule(nodes);
    const url = `${window.location.origin}${window.location.pathname}?s=${encoded}`;
    await navigator.clipboard.writeText(url);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <header className="h-12 flex items-center justify-between px-4 border-b border-border bg-card shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-sm bg-foreground/10 flex items-center justify-center">
          <Clock className="w-3.5 h-3.5 text-foreground" />
        </div>
        <span className="text-[13px] font-medium text-foreground">
          Deja Vu Playground
        </span>
      </div>

      <span className="text-xs text-muted-foreground hidden md:block">
        Visual Schedule Builder
      </span>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className={`h-7 text-xs gap-1 transition-colors ${shared ? "text-expr-emerald" : "text-muted-foreground"}`}
          onClick={handleShare}
          disabled={nodes.length === 0}
        >
          {shared ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
          {shared ? "Copied!" : "Share"}
        </Button>

        <a
          href="https://github.com/rutaks/deja-vu"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </a>
        <a
          href="https://www.npmjs.com/package/@rutaks/deja-vu"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
          >
            <Package className="w-3.5 h-3.5" />
          </Button>
        </a>

        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="w-3.5 h-3.5" />
            ) : (
              <Moon className="w-3.5 h-3.5" />
            )}
          </Button>
        )}
      </div>
    </header>
  );
}
