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
};

export default function ConnectionsLayer({ connections, onRemove }: Props) {
  const [paths, setPaths] = useState<PathData[]>([]);

  const computePaths = useCallback(() => {
    const result: PathData[] = [];
    for (const conn of connections) {
      const fromEl = document.getElementById(`card-${conn.fromId}`);
      const toEl = document.getElementById(`card-${conn.toId}`);
      if (!fromEl || !toEl) continue;

      const fr = fromEl.getBoundingClientRect();
      const tr = toEl.getBoundingClientRect();

      const x1 = fr.right + window.scrollX;
      const y1 = fr.top + fr.height / 2 + window.scrollY;
      const x2 = tr.left + window.scrollX;
      const y2 = tr.top + tr.height / 2 + window.scrollY;

      const dx = (x2 - x1) * 0.45;

      const d = `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;

      // Midpoint for hit area
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
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      <defs>
        <marker
          id="cer-arrow"
          markerWidth="8"
          markerHeight="7"
          refX="7"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 8 3.5, 0 7" fill="#5BA8D4" />
        </marker>
      </defs>

      {paths.map((p) => (
        <g key={p.id} style={{ pointerEvents: "all" }}>
          {/* Invisible wide stroke for easy clicking */}
          <path
            d={p.d}
            fill="none"
            stroke="transparent"
            strokeWidth={16}
            style={{ cursor: "pointer" }}
            onClick={() => onRemove(p.id)}
          />
          {/* Visible dashed line */}
          <path
            d={p.d}
            fill="none"
            stroke="#5BA8D4"
            strokeWidth={2.5}
            strokeDasharray="6 3"
            markerEnd="url(#cer-arrow)"
            style={{ pointerEvents: "none" }}
          />
          {/* Delete hit circle at midpoint */}
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
        </g>
      ))}
    </svg>
  );
}