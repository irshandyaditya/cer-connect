"use client";

import { useState, memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CardType } from "../types";

type Props = {
  card: CardType;
  onClick: (id: string) => void;
  onStartConnect: (id: string) => void;
  isConnecting: boolean;
  isSource: boolean;
};

function CardItemComponent({
  card,
  onClick,
  onStartConnect,
  isConnecting,
  isSource,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ 
        id: card.id,
        transition: null,
    });

  const [hovered, setHovered] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    // transition,
  };

  return (
    <div
      id={card.id}
      ref={setNodeRef}
      style={style}
      onClick={() => isConnecting && onClick(card.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative p-3 border rounded transition-all duration-200
        ${
          isSource
            ? "bg-blue-100 border-blue-500 ring-2 ring-blue-400"
            : "bg-gray-50"
        }
        ${isConnecting && !isSource ? "cursor-pointer hover:bg-green-50" : ""}
      `}
    >
      {card.content}

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute bottom-1 right-1 text-gray-400 cursor-grab text-xs"
      >
        ☰
      </div>

      {hovered && !isSource && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStartConnect(card.id);
          }}
          className="absolute top-1 right-1 text-xs bg-blue-500 text-white px-2 py-1 rounded"
        >
          +
        </button>
      )}
    </div>
  );
}

export default memo(CardItemComponent);
