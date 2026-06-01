"use client";

import { useEffect, useRef, useState } from "react";
import { ColumnType } from "../types";

const COL_LABEL: Record<ColumnType, string> = {
  claim: "Claim",
  evidence: "Evidence",
  reasoning: "Reasoning",
};

type Props = {
  column: ColumnType;
  onConfirm: (text: string) => void;
  onClose: () => void;
};

export default function AddCardModal({ column, onConfirm, onClose }: Props) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && e.ctrlKey) handleConfirm();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  function handleConfirm() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(10,10,30,0.35)", backdropFilter: "blur(2px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-[18px] p-7 shadow-2xl w-full max-w-md mx-4"
        style={{ animation: "slideUp 0.18s ease" }}
      >
        <h3 className="text-[17px] font-bold text-gray-900 mb-1">
          Tambah {COL_LABEL[column]}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Tulis pernyataan atau isi kartu baru. (Ctrl+Enter untuk simpan)
        </p>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tulis pernyataan di sini..."
          rows={4}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-[13.5px] text-gray-800 
            outline-none resize-y font-[inherit] leading-relaxed
            focus:border-[#5BA8D4] transition-colors"
        />

        <div className="flex gap-3 mt-4 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border-2 border-gray-200 text-sm font-semibold 
              text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={!text.trim()}
            className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-opacity
              disabled:opacity-50"
            style={{ background: "#5BA8D4" }}
          >
            Tambah
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}