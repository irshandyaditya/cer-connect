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
  reviewMode?: boolean;
  correctConnIds?: Set<string>;
  isStudent?: boolean;
};

// Fixed card height — semua kartu seragam tingginya
const CARD_HEIGHT = 120; // px, area teks scroll internal

function CardItem({
  card,
  colDef,
  cardState,
  myConnections,
  onCardClick,
  onStartConnect,
  onRemoveConnection,
  onDeleteCard,
  reviewMode = false,
  correctConnIds = new Set(),
  isStudent = false,
}: Props) {
  const [hovered, setHovered] = useState(false);

  const headerColor = HEADER_COLOR[card.column];

  const hasConnection = myConnections.length > 0;
  const hasCorrect = myConnections.some((c) => correctConnIds.has(c.id));
  const reviewBorderColor = reviewMode && hasConnection
    ? (hasCorrect ? "#22c55e" : "#ef4444")
    : undefined;

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

  const showActionBar = !reviewMode && hovered && cardState === "normal";
  const hasConnectAction = !!colDef.canConnectTo;
  const hasDeleteAction = !isStudent;

  return (
    <div
      id={`card-${card.id}`}
      data-card-id={card.id}
      className={`relative bg-white rounded-xl border-2 transition-all duration-150 group flex flex-col
        ${reviewMode ? "" : stateStyles[cardState]}
        ${cardState === "normal" && !reviewMode ? "hover:shadow-lg" : ""}
      `}
      style={{
        boxShadow: cardState === "normal" && !reviewMode ? "0 2px 8px rgba(0,0,0,0.08)" : undefined,
        borderColor: reviewBorderColor,
        ...(reviewBorderColor ? { boxShadow: `0 0 0 2px ${reviewBorderColor}40` } : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Text area — fixed height, scroll kalau overflow */}
      <div
        className="px-3.5 pt-3.5 overflow-y-auto flex-1"
        style={{ height: CARD_HEIGHT }}
      >
        <p className="text-[12px] leading-relaxed text-gray-800 break-words">
          {card.text}
        </p>
      </div>

      {/* Action bar — hidden in review mode, always takes space to keep height consistent */}
      {!reviewMode && (hasConnectAction || hasDeleteAction) && (
        <div
          className={`flex items-center gap-2 px-3.5 pb-2.5 pt-2 border-t border-gray-100 transition-opacity duration-150
            ${showActionBar ? "opacity-100" : "opacity-0 pointer-events-none"}
          `}
        >
          {/* Delete — kiri, hanya non-student */}
          {hasDeleteAction && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm("Hapus kartu ini?")) {
                  onDeleteCard(card.id);
                }
              }}
              className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md px-1.5 py-0.5 text-sm transition-colors"
              title="Hapus kartu"
            >
              ✕
            </button>
          )}

          <div className="flex-1" />

          {/* Hubungkan — kanan */}
          {hasConnectAction && (
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
        </div>
      )}

      {/* Spacer bawah kalau tidak ada action bar (review mode / reasoning col) */}
      {(reviewMode || (!hasConnectAction && !hasDeleteAction)) && (
        <div className="pb-2" />
      )}
    </div>
  );
}

export default memo(CardItem);