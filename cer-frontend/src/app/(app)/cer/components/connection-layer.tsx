"use client";

import { useEffect, useState, useCallback } from "react";
import { ConnectionType } from "../types";

type PathData = {
  id: string;
  d: string;
  midX: number;
  midY: number;
};

type Props = {
  connections: ConnectionType[];
  onRemove: (connId: string) => void;
  reviewMode?: boolean;
  correctConnIds?: Set<string>;
};

export default function ConnectionsLayer({ connections, onRemove, reviewMode = false, correctConnIds = new Set() }: Props) {
  const [paths, setPaths] = useState<PathData[]>([]);

  const computePaths = useCallback(() => {
    const result: PathData[] = [];
    for (const conn of connections) {
      const fromEl = document.getElementById(`card-${conn.fromId}`);
      const toEl = document.getElementById(`card-${conn.toId}`);
      if (!fromEl || !toEl) continue;

      const fr = fromEl.getBoundingClientRect();
      const tr = toEl.getBoundingClientRect();

      // Use viewport-relative coords since SVG is fixed
      const x1 = fr.right;
      const y1 = fr.top + fr.height / 2;
      const x2 = tr.left;
      const y2 = tr.top + tr.height / 2;

      const dx = (x2 - x1) * 0.45;
      const d = `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2 - Math.abs(y2 - y1) * 0.15;

      result.push({ id: conn.id, d, midX, midY });
    }
    setPaths(result);
  }, [connections]);

  useEffect(() => {
    computePaths();
    const ro = new ResizeObserver(computePaths);
    ro.observe(document.body);
    // Listen to all scroll events (window + any scrollable container)
    window.addEventListener("scroll", computePaths, true);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", computePaths, true);
    };
  }, [computePaths]);

  if (paths.length === 0) return null;

  return (
    <svg
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      <defs>
        <marker id="cer-arrow" markerWidth="8" markerHeight="7" refX="7" refY="3.5" orient="auto" />
        <marker id="cer-arrow-correct" markerWidth="8" markerHeight="7" refX="7" refY="3.5" orient="auto" />
        <marker id="cer-arrow-wrong" markerWidth="8" markerHeight="7" refX="7" refY="3.5" orient="auto" />
      </defs>

      {paths.map((p) => {
        const isCorrect = correctConnIds.has(p.id);
        const color = reviewMode
          ? (isCorrect ? "#22c55e" : "#ef4444")
          : "#5BA8D4";
        const arrowId = reviewMode
          ? (isCorrect ? "cer-arrow-correct" : "cer-arrow-wrong")
          : "cer-arrow";

        return (
          <g key={p.id} style={{ pointerEvents: "all" }}>
            {/* Invisible wide stroke for easy clicking */}
            <path
              d={p.d}
              fill="none"
              stroke="transparent"
              strokeWidth={16}
              style={{ cursor: reviewMode ? "default" : "pointer" }}
              onClick={() => !reviewMode && onRemove(p.id)}
            />
            {/* Visible line */}
            <path
              d={p.d}
              fill="none"
              stroke={color}
              strokeWidth={reviewMode ? 3 : 2.5}
              strokeDasharray={reviewMode ? undefined : "6 3"}
              markerEnd={`url(#${arrowId})`}
              style={{ pointerEvents: "none" }}
            />
            {/* Delete circle — hidden in review mode */}
            {!reviewMode && (
              <>
                <circle
                  cx={p.midX}
                  cy={p.midY}
                  r={10}
                  fill="white"
                  stroke="#5BA8D4"
                  strokeWidth={1.5}
                  style={{ cursor: "pointer" }}
                  onClick={() => onRemove(p.id)}
                />
                <text
                  x={p.midX}
                  y={p.midY + 4.5}
                  textAnchor="middle"
                  fontSize={12}
                  fill="#cc5555"
                  style={{ cursor: "pointer", userSelect: "none", pointerEvents: "none" }}
                >
                  ✕
                </text>
              </>
            )}
            {/* Review mode badge */}
            {reviewMode && (
              <>
                <circle cx={p.midX} cy={p.midY} r={10} fill={color} />
                <text
                  x={p.midX}
                  y={p.midY + 4.5}
                  textAnchor="middle"
                  fontSize={12}
                  fill="white"
                  style={{ userSelect: "none", pointerEvents: "none" }}
                >
                  {isCorrect ? "✓" : "✕"}
                </text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}