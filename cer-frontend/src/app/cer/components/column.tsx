"use client";

import { memo } from "react";
import { CardType, ColDef, ConnectionType, ConnectingFromType, ColumnType } from "../types";
import CardItem from "./card-item";

const COL_STYLES: Record<ColumnType, {
  bg: string;
  header: string;
  addBtn: string;
  addBtnHover: string;
  border: string;
}> = {
  claim: {
    bg: "#E8F4FD",
    header: "#5BA8D4",
    addBtn: "text-[#3A8CC4] border-[#A8D4EF] hover:bg-[#5BA8D4]/10",
    addBtnHover: "",
    border: "#A8D4EF",
  },
  evidence: {
    bg: "#EAF3EC",
    header: "#6BAA78",
    addBtn: "text-[#4A8F5A] border-[#A8D1B0] hover:bg-[#6BAA78]/10",
    addBtnHover: "",
    border: "#A8D1B0",
  },
  reasoning: {
    bg: "#EFE8F5",
    header: "#9B7CC4",
    addBtn: "text-[#7A5CAD] border-[#C4A8DF] hover:bg-[#9B7CC4]/10",
    addBtnHover: "",
    border: "#C4A8DF",
  },
};

type Props = {
  colDef: ColDef;
  cards: CardType[];
  connections: ConnectionType[];
  connectingFrom: ConnectingFromType;
  onCardClick: (cardId: string, col: ColumnType) => void;
  onStartConnect: (cardId: string, col: ColumnType) => void;
  onRemoveConnection: (connId: string) => void;
  onDeleteCard: (cardId: string) => void;
  onAddCard: () => void;
};

function Column({
  colDef,
  cards,
  connections,
  connectingFrom,
  onCardClick,
  onStartConnect,
  onRemoveConnection,
  onDeleteCard,
  onAddCard,
}: Props) {
  const styles = COL_STYLES[colDef.id];

  return (
    <div
      className="flex-1 min-w-0 flex flex-col rounded-[18px] pb-4"
      style={{ background: styles.bg }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3.5 rounded-t-[18px] text-white font-bold text-[15px] mb-2.5"
        style={{ background: styles.header }}
      >
        <span>{colDef.icon}</span>
        <span>{colDef.label}</span>
        <span className="text-[11px] font-medium opacity-80 ml-1">({cards.length})</span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2.5 px-3">
        {cards.map((card) => {
          // Determine card state
          let cardState: "normal" | "source" | "valid-target" | "invalid-target" = "normal";
          if (connectingFrom) {
            if (connectingFrom.cardId === card.id) {
              cardState = "source";
            } else {
              const { colDef: sourceDef } = { colDef: { canConnectTo: connectingFrom ? (colDef.id === "claim" ? null : colDef.id === "evidence" ? null : null) : null } };
              // Find source col def
              const sourceColDef = ["claim", "evidence", "reasoning"].find(
                (id) => id === connectingFrom.column
              );
              const canConnectHere =
                (connectingFrom.column === "claim" && colDef.id === "evidence") ||
                (connectingFrom.column === "evidence" && colDef.id === "reasoning");

              if (canConnectHere) {
                const alreadyConnected = connections.some(
                  (c) =>
                    (c.fromId === connectingFrom.cardId && c.toId === card.id) ||
                    (c.fromId === card.id && c.toId === connectingFrom.cardId)
                );
                const sourceHasOutgoing = connections.some(
                  (c) => c.fromId === connectingFrom.cardId
                );
                cardState = alreadyConnected || sourceHasOutgoing ? "invalid-target" : "valid-target";
              } else {
                cardState = "invalid-target";
              }
            }
          }

          const myConns = connections.filter(
            (c) => c.fromId === card.id || c.toId === card.id
          );

          return (
            <CardItem
              key={card.id}
              card={card}
              colDef={colDef}
              cardState={cardState}
              myConnections={myConns}
              onCardClick={onCardClick}
              onStartConnect={onStartConnect}
              onRemoveConnection={onRemoveConnection}
              onDeleteCard={onDeleteCard}
            />
          );
        })}
      </div>

      {/* Add button */}
      <button
        onClick={onAddCard}
        className={`mx-3 mt-3 py-2.5 rounded-xl border-2 border-dashed text-sm font-semibold transition-colors ${styles.addBtn}`}
      >
        + Tambah {colDef.label}
      </button>
    </div>
  );
}

export default memo(Column);