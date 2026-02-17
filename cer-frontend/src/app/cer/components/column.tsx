"use client";

import { memo } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import CardItem from "./card-item";
import { CardType, ColumnType } from "../types";

type Props = {
  column: ColumnType;
  cards: CardType[];
  onCardClick: (id: string) => void;
  onStartConnect: (id: string) => void;
  connectingFrom: string | null;
};

function ColumnComponent({
  column,
  cards,
  onCardClick,
  onStartConnect,
  connectingFrom,
}: Props) {
  return (
    <div className="bg-white p-4 rounded shadow min-h-[400px]">
      <h2 className="font-semibold mb-4 capitalize">{column}</h2>

      <SortableContext
        items={cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-3">
          {cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onClick={onCardClick}
              onStartConnect={onStartConnect}
              isConnecting={!!connectingFrom}
              isSource={connectingFrom === card.id}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export default memo(ColumnComponent);
