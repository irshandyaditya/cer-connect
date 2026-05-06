"use client";

import { memo, useState } from "react";
import { CardType, ColDef, ConnectionType, ColumnType } from "../types";

const ACCENT: Record<ColumnType, string> = {
  claim: "#3A8CC4",
  evidence: "#4A8F5A",
  reasoning: "#7A5CAD",
};

const HEADER_COLOR: Record<ColumnType, string> = {
  claim: "#5BA8D4",
  evidence: "#6BAA78",
  reasoning: "#9B7CC4",
};

type CardState = "normal" | "source" | "valid-target" | "invalid-target";

type Props = {
  card: CardType;
  colDef: ColDef;
  cardState: CardState;
  myConnections: ConnectionType[];
  onCardClick: (cardId: string, col: ColumnType) => void;
  onStartConnect: (cardId: string, col: ColumnType) => void;
  onRemoveConnection: (connId: string) => void;
  onDeleteCard: (cardId: string) => void;
};

const TRUNCATE_LENGTH = 160;

function CardItem({
  card,
  colDef,
  cardState,
  myConnections,
  onCardClick,
  onStartConnect,
  onRemoveConnection,
  onDeleteCard,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const needsTruncate = card.text.length > TRUNCATE_LENGTH;
  const displayText =
    !expanded && needsTruncate ? card.text.slice(0, TRUNCATE_LENGTH) + "..." : card.text;

  const accent = ACCENT[card.column];
  const headerColor = HEADER_COLOR[card.column];

  // Border/ring styles based on state
  const stateStyles: Record<CardState, string> = {
    normal: "border-transparent",
    source: "border-[#5BA8D4] ring-2 ring-[#5BA8D4]/25",
    "valid-target": "border-[#6BAA78] ring-2 ring-[#6BAA78]/25 cursor-pointer",
    "invalid-target": "opacity-40 cursor-not-allowed",
  };

  const handleClick = () => {
    if (cardState === "valid-target") {
      onCardClick(card.id, card.column);
    }
  };

  return (
    <div
      id={`card-${card.id}`}
      className={`relative bg-white rounded-xl border-2 p-3.5 transition-all duration-150 group
        ${stateStyles[cardState]}
        ${cardState === "normal" ? "hover:shadow-lg" : ""}
      `}
      style={{
        boxShadow: cardState === "normal" ? "0 2px 8px rgba(0,0,0,0.08)" : undefined,
        minHeight: "80px",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Text */}
      <p className="text-[13.5px] leading-relaxed text-gray-800 break-words">
        {displayText}
      </p>

      {/* Expand/collapse */}
      {needsTruncate && (
        <button
          className="text-xs font-semibold mt-1 block"
          style={{ color: accent }}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
        >
          {expanded ? "▲ Tutup" : "▼ Selengkapnya"}
        </button>
      )}

      {/* Connection badges */}
      {myConnections.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {myConnections.map((conn) => {
            const isOutgoing = conn.fromId === card.id;
            return (
              <button
                key={conn.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveConnection(conn.id);
                }}
                className="inline-flex items-center gap-1 text-[10.5px] font-medium px-2 py-0.5 rounded-full border transition-colors"
                style={{
                  background: "#f5f5f8",
                  borderColor: "#e0e0ee",
                  color: "#555577",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#ffeaea";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#ffcccc";
                  (e.currentTarget as HTMLButtonElement).style.color = "#cc3333";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#f5f5f8";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#e0e0ee";
                  (e.currentTarget as HTMLButtonElement).style.color = "#555577";
                }}
                title="Klik untuk hapus koneksi"
              >
                <span className="text-[9px]">{isOutgoing ? "→" : "←"}</span>
                <span>{isOutgoing ? conn.toId.slice(0, 4) : conn.fromId.slice(0, 4)}…</span>
                <span className="text-[9px]">✕</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Action bar — visible on hover */}
      <div
        className={`flex items-center gap-2 mt-2.5 pt-2 border-t border-gray-100 transition-opacity duration-150
          ${hovered && cardState === "normal" ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
      >
        {/* Connect button — only for claim and evidence */}
        {colDef.canConnectTo && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartConnect(card.id, card.column);
            }}
            className="text-[11px] font-semibold px-3 py-1 rounded-full text-white transition-opacity hover:opacity-85"
            style={{ background: headerColor }}
          >
            🔗 Hubungkan
          </button>
        )}

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm("Hapus kartu ini?")) {
              onDeleteCard(card.id);
            }
          }}
          className="ml-auto text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md px-1.5 py-0.5 text-sm transition-colors"
          title="Hapus kartu"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default memo(CardItem);