"use client";

import { useEffect, useState } from "react";
import { DndContext, closestCenter, DragEndEvent  } from "@dnd-kit/core";
import Column from "./column";
import ConnectionsLayer from "./connection-layers";
import { CardType, ConnectionType } from "../types";
import dynamic from "next/dynamic";
import { useXarrow } from "react-xarrows";
import { arrayMove } from "@dnd-kit/sortable";

export default function Board() {
  const [cards, setCards] = useState<CardType[]>([
    { id: "c1", content: "Claim 1", column: "claim" },
    { id: "c2", content: "Claim 2", column: "claim" },
    { id: "e1", content: "Evidence 1", column: "evidence" },
    { id: "e2", content: "Evidence 2", column: "evidence" },
    { id: "r1", content: "Reasoning 1", column: "reasoning" },
    { id: "r2", content: "Reasoning 2", column: "reasoning" },
  ]);

    const Xwrapper = dynamic(
        () => import("react-xarrows").then((mod) => mod.Xwrapper),
        { ssr: false }
    );

    const claimCards = cards.filter((c) => c.column === "claim");
    const evidenceCards = cards.filter((c) => c.column === "evidence");
    const reasoningCards = cards.filter((c) => c.column === "reasoning");


    const [connections, setConnections] = useState<ConnectionType[]>([]);
    const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
    const updateXarrow = useXarrow();
    const [isDragging, setIsDragging] = useState(false);


    function startConnecting(cardId: string) {
        setConnectingFrom(cardId);
    }

    function handleCardClick(cardId: string) {
        if (!connectingFrom) return;

        if (connectingFrom !== cardId) {
            setConnections((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                fromId: connectingFrom,
                toId: cardId,
            },
            ]);

            setTimeout(() => {
            updateXarrow();
            }, 0);
        }

        setConnectingFrom(null);
    }
    
    // useEffect(() => {
    //     updateXarrow();
    // }, [connections]);


    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        setCards((prev) => {
            const oldIndex = prev.findIndex((c) => c.id === active.id);
            const newIndex = prev.findIndex((c) => c.id === over.id);

            return arrayMove(prev, oldIndex, newIndex);
        });

        setTimeout(() => {
            updateXarrow();
        }, 0);
    }


    useEffect(() => {
        setConnections([
            {
            id: "test",
            fromId: "c1",
            toId: "e1",
            },
        ]);
    }, []);


  return (
    <Xwrapper>

        <DndContext 
            collisionDetection={closestCenter}
            // onDragEnd={handleDragEnd}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(event) => {
                setIsDragging(false);
                handleDragEnd(event);
            }}
        >
            <div className="grid grid-cols-3 gap-6 relative">
                <Column
                    column="claim"
                    cards={claimCards}
                    onCardClick={handleCardClick}
                    onStartConnect={startConnecting}
                    connectingFrom={connectingFrom}
                />

                <Column
                    column="evidence"
                    cards={evidenceCards}
                    onCardClick={handleCardClick}
                    onStartConnect={startConnecting}
                    connectingFrom={connectingFrom}
                />

                <Column
                    column="reasoning"
                    cards={reasoningCards}
                    onCardClick={handleCardClick}
                    onStartConnect={startConnecting}
                    connectingFrom={connectingFrom}
                />
            </div>

            <ConnectionsLayer connections={connections} />
        </DndContext>
    </Xwrapper>
  );
}
