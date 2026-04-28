"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { CardType, ConnectionType, ConnectingFromType, COL_DEFS, ColumnType } from "../types";
import Column from "./column";
import ConnectionsLayer from "./connection-layer";
import AddCardModal from "./add-card-modal";
import Toast from "./toast";

function uid() {
  return "id_" + Math.random().toString(36).slice(2, 9);
}

const INITIAL_CARDS: CardType[] = [
  { id: "c1", column: "claim", text: "MySQL adalah sistem manajemen basis data relasional yang dikembangkan oleh Oracle." },
  { id: "c2", column: "claim", text: "Indeks pada database mempercepat pencarian data secara signifikan." },
  { id: "e1", column: "evidence", text: "Menurut dokumentasi resmi MySQL, sistem ini menggunakan SQL sebagai bahasa kueri standar dan mendukung transaksi ACID penuh." },
  { id: "e2", column: "evidence", text: "Benchmark menunjukkan query dengan indeks B-tree 100x lebih cepat dibanding full table scan pada tabel dengan 1 juta baris data." },
  { id: "r1", column: "reasoning", text: "Dengan kemampuan transaksi ACID dan dukungan komunitas yang luas, MySQL menjadi pilihan utama untuk aplikasi skala besar yang membutuhkan konsistensi data tinggi." },
  { id: "r2", column: "reasoning", text: "Performa indeks yang superior mendukung arsitektur database yang lebih efisien untuk aplikasi dengan beban kueri tinggi." },
];

const INITIAL_CONNECTIONS: ConnectionType[] = [
  { id: "conn1", fromId: "c1", toId: "e1" },
];

export default function Board() {
  const [cards, setCards] = useState<CardType[]>(INITIAL_CARDS);
  const [connections, setConnections] = useState<ConnectionType[]>(INITIAL_CONNECTIONS);
  const [connectingFrom, setConnectingFrom] = useState<ConnectingFromType>(null);
  const [addModalCol, setAddModalCol] = useState<ColumnType | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  // Cancel connecting on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConnectingFrom(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleStartConnect = useCallback((cardId: string, column: ColumnType) => {
    setConnectingFrom({ cardId, column });
  }, []);

  const handleCardClick = useCallback((targetId: string, targetCol: ColumnType) => {
    if (!connectingFrom) return;

    const sourceColDef = COL_DEFS.find((c) => c.id === connectingFrom.column);
    if (!sourceColDef || sourceColDef.canConnectTo !== targetCol) return;

    const alreadyConnected = connections.some(
      (c) =>
        (c.fromId === connectingFrom.cardId && c.toId === targetId) ||
        (c.fromId === targetId && c.toId === connectingFrom.cardId)
    );
    const sourceHasOutgoing = connections.some((c) => c.fromId === connectingFrom.cardId);

    if (!alreadyConnected && !sourceHasOutgoing) {
      setConnections((prev) => [
        ...prev,
        { id: uid(), fromId: connectingFrom.cardId, toId: targetId },
      ]);
      showToast("Koneksi berhasil dibuat!");
    } else if (sourceHasOutgoing) {
      showToast("Kartu ini sudah memiliki koneksi.");
    } else {
      showToast("Koneksi sudah ada.");
    }

    setConnectingFrom(null);
  }, [connectingFrom, connections, showToast]);

  const handleRemoveConnection = useCallback((connId: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== connId));
    showToast("Koneksi dihapus.");
  }, [showToast]);

  const handleDeleteCard = useCallback((cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    setConnections((prev) => prev.filter((c) => c.fromId !== cardId && c.toId !== cardId));
    showToast("Kartu dihapus.");
  }, [showToast]);

  const handleAddCard = useCallback((text: string) => {
    if (!addModalCol) return;
    setCards((prev) => [...prev, { id: uid(), column: addModalCol, text }]);
    setAddModalCol(null);
  }, [addModalCol]);

  return (
    <>
      {/* Connecting mode banner */}
      {connectingFrom && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full text-white text-sm font-bold shadow-lg cursor-pointer select-none"
          style={{ background: "#5BA8D4", boxShadow: "0 4px 20px rgba(91,168,212,0.4)" }}
          onClick={() => setConnectingFrom(null)}
        >
          Pilih kartu {COL_DEFS.find(c => c.id === connectingFrom.column)?.canConnectTo} yang ingin dihubungkan &nbsp;·&nbsp; Klik di sini untuk batal
        </div>
      )}

      <div className="flex gap-4 p-6 items-start min-h-screen bg-[#F2F4F8]">
        {COL_DEFS.map((colDef) => {
          const colCards = cards.filter((c) => c.column === colDef.id);
          return (
            <Column
              key={colDef.id}
              colDef={colDef}
              cards={colCards}
              connections={connections}
              connectingFrom={connectingFrom}
              onCardClick={handleCardClick}
              onStartConnect={handleStartConnect}
              onRemoveConnection={handleRemoveConnection}
              onDeleteCard={handleDeleteCard}
              onAddCard={() => setAddModalCol(colDef.id)}
            />
          );
        })}
      </div>

      {/* SVG arrows overlay */}
      <ConnectionsLayer connections={connections} onRemove={handleRemoveConnection} />

      {/* Add card modal */}
      {addModalCol && (
        <AddCardModal
          column={addModalCol}
          onConfirm={handleAddCard}
          onClose={() => setAddModalCol(null)}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} />}
    </>
  );
}