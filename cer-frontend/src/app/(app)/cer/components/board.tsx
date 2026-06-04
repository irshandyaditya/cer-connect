"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CardType, ConnectionType, ConnectingFromType, COL_DEFS, ColumnType } from "../types";
import Column from "./column";
import AddCardModal from "./add-card-modal";
import Toast from "./toast";
import ConnectionsLayer from "./connection-layer";
import { useAuth } from "@/store/auth-store";
import {
  createCards,
  createConnections,
  submitAnswers,
  getMapDetail,
  getMySubmissionResult,
  CardPayloadItem,
  ConnectionPayloadItem,
} from "@/lib/api";
import StudentSubmissionsModal from "./student-submissions-modal";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid() {
  return "id_" + Math.random().toString(36).slice(2, 9);
}

const BASE_URL = "http://localhost:3020";

// ─── Sub-components ──────────────────────────────────────────────────────────

function BackConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[360px] overflow-hidden">
        <div className="px-6 py-5">
          <p className="text-[15px] font-semibold text-gray-900 mb-1">Kembali ke Daftar Map?</p>
          <p className="text-[13px] text-gray-500 leading-relaxed">
            Jika kembali, semua progres yang belum disimpan akan hilang dan Anda harus mengulang dari awal.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onCancel} className="h-[36px] px-4 rounded-lg border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-100 transition-colors">
            Tetap di sini
          </button>
          <button onClick={onConfirm} className="h-[36px] px-5 rounded-lg bg-red-500 text-white text-[13px] font-medium hover:bg-red-600 transition-colors">
            Ya, kembali
          </button>
        </div>
      </div>
    </div>
  );
}

function DocumentPreviewModal({ url, onClose }: { url: string; onClose: () => void }) {
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <p className="text-[14px] font-semibold text-gray-900">Preview Materi</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          {/* Production */}
          {/* <iframe src={viewerUrl} className="w-full h-full border-0" title="Preview Materi" sandbox="allow-scripts allow-same-origin allow-popups" /> */}
          {/* Local */}
          <iframe src={fullUrl} className="w-full h-full border-0" title="Preview Materi" />
        </div>
      </div>
    </div>
  );
}

function TeacherSubmitModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[360px] overflow-hidden">
        <div className="px-6 py-6 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#4A9E8E]/15 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4A9E8E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p className="text-[15px] font-semibold text-gray-900">CER Berhasil Disimpan!</p>
          <p className="text-[13px] text-gray-500 text-center leading-relaxed">
            Kartu dan koneksi telah tersimpan sebagai kunci jawaban untuk map ini.
          </p>
        </div>
        <div className="flex justify-center px-6 pb-5">
          <button onClick={onClose} className="h-[36px] px-6 rounded-lg bg-[#1C1C2E] text-white text-[13px] font-medium hover:bg-[#2d2d44] transition-colors">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

function StudentResultModal({ score, correct, total, onClose }: { score: number; correct: number; total: number; onClose: () => void }) {
  const wrong = total - correct;
  const pct = Math.round(score);
  const isGood = pct >= 70;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] overflow-hidden">
        <div className="px-6 py-6 flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-[22px] font-bold" style={{ background: isGood ? "#4A9E8E" : "#E05252" }}>
            {pct}%
          </div>
          <p className="text-[15px] font-semibold text-gray-900">Hasil Pengerjaan</p>
          <div className="flex gap-4 w-full justify-center">
            <div className="flex flex-col items-center gap-1 px-5 py-3 bg-green-50 rounded-xl">
              <span className="text-[22px] font-bold text-green-600">{correct}</span>
              <span className="text-[11px] text-green-600 font-medium">Benar</span>
            </div>
            <div className="flex flex-col items-center gap-1 px-5 py-3 bg-red-50 rounded-xl">
              <span className="text-[22px] font-bold text-red-500">{wrong}</span>
              <span className="text-[11px] text-red-500 font-medium">Salah</span>
            </div>
            <div className="flex flex-col items-center gap-1 px-5 py-3 bg-gray-50 rounded-xl">
              <span className="text-[22px] font-bold text-gray-700">{total}</span>
              <span className="text-[11px] text-gray-500 font-medium">Total</span>
            </div>
          </div>
          <p className="text-[12px] text-gray-400 text-center">
            Tutup untuk melihat koneksi mana yang benar (hijau) dan salah (merah).
          </p>
        </div>
        <div className="flex justify-center px-6 pb-5">
          <button onClick={onClose} className="h-[36px] px-6 rounded-lg bg-[#1C1C2E] text-white text-[13px] font-medium hover:bg-[#2d2d44] transition-colors">
            Lihat Review
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Animated Card List ───────────────────────────────────────────────────────

/**
 * Wraps cards in a column with CSS-based slide animation.
 * Each card gets a data-card-id attribute and uses CSS transitions on `top`.
 * We track prev positions and animate to new positions using the FLIP technique.
 */
function useCardAnimation(cards: CardType[]) {
  const prevPositions = useRef<Map<string, number>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const animatingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Get current positions
    const cardEls = container.querySelectorAll<HTMLElement>("[data-card-id]");
    const currentPositions = new Map<string, number>();
    cardEls.forEach((el) => {
      const id = el.getAttribute("data-card-id")!;
      currentPositions.set(id, el.getBoundingClientRect().top);
    });

    // Animate cards that moved
    cardEls.forEach((el) => {
      const id = el.getAttribute("data-card-id")!;
      const prev = prevPositions.current.get(id);
      const curr = currentPositions.get(id);

      if (prev !== undefined && curr !== undefined && prev !== curr) {
        const delta = prev - curr;
        if (Math.abs(delta) > 2) {
          // Apply inverse transform immediately (no transition)
          el.style.transition = "none";
          el.style.transform = `translateY(${delta}px)`;

          // Force reflow
          el.getBoundingClientRect();

          // Animate to natural position
          el.style.transition = "transform 350ms cubic-bezier(0.25, 0.46, 0.45, 0.94)";
          el.style.transform = "translateY(0)";

          animatingRef.current.add(id);
          const onEnd = () => {
            el.style.transition = "";
            el.style.transform = "";
            animatingRef.current.delete(id);
          };
          el.addEventListener("transitionend", onEnd, { once: true });
        }
      }
    });

    // Save current positions for next render
    prevPositions.current = currentPositions;
  });

  return containerRef;
}

// ─── Main Board ───────────────────────────────────────────────────────────────

export default function Board() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mapId = searchParams.get("mapId");
  const { token, role } = useAuth();

  const [cards, setCards] = useState<CardType[]>([]);
  const [connections, setConnections] = useState<ConnectionType[]>([]);
  const [connectingFrom, setConnectingFrom] = useState<ConnectingFromType>(null);
  const [addModalCol, setAddModalCol] = useState<ColumnType | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [showDocPreview, setShowDocPreview] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [docUrl, setDocUrl] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [teacherSubmitted, setTeacherSubmitted] = useState(false);
  const [studentResult, setStudentResult] = useState<{ score: number; correct: number; total: number } | null>(null);

  const [reviewMode, setReviewMode] = useState(false);
  const [correctConnIds, setCorrectConnIds] = useState<Set<string>>(new Set());
  const [correctPairs, setCorrectPairs] = useState<{ fromId: string; toId: string }[]>([]);

  const [loadingMap, setLoadingMap] = useState(true);

  // Per-column animation refs
  const claimRef = useRef<HTMLDivElement>(null);
  const evidenceRef = useRef<HTMLDivElement>(null);
  const reasoningRef = useRef<HTMLDivElement>(null);
  const colRefs: Record<ColumnType, React.RefObject<HTMLDivElement | null>> = {
    claim: claimRef,
    evidence: evidenceRef,
    reasoning: reasoningRef,
  };

  // Track positions before cards state updates for FLIP animation
  const prevCardPositions = useRef<Map<string, number>>(new Map());

  // Capture positions before render
  const capturePositions = useCallback(() => {
    const positions = new Map<string, number>();
    Object.values(colRefs).forEach((ref) => {
      if (!ref.current) return;
      ref.current.querySelectorAll<HTMLElement>("[data-card-id]").forEach((el) => {
        const id = el.getAttribute("data-card-id")!;
        positions.set(id, el.getBoundingClientRect().top);
      });
    });
    prevCardPositions.current = positions;
  }, []);

  // Run FLIP animation after render
  const animateCards = useCallback(() => {
    Object.values(colRefs).forEach((ref) => {
      if (!ref.current) return;
      ref.current.querySelectorAll<HTMLElement>("[data-card-id]").forEach((el) => {
        const id = el.getAttribute("data-card-id")!;
        const prev = prevCardPositions.current.get(id);
        const curr = el.getBoundingClientRect().top;

        if (prev !== undefined && Math.abs(prev - curr) > 2) {
          const delta = prev - curr;
          el.style.transition = "none";
          el.style.transform = `translateY(${delta}px)`;
          el.getBoundingClientRect(); // force reflow
          el.style.transition = "transform 380ms cubic-bezier(0.25, 0.46, 0.45, 0.94)";
          el.style.transform = "translateY(0)";
          el.addEventListener("transitionend", () => {
            el.style.transition = "";
            el.style.transform = "";
          }, { once: true });
        }
      });
    });
  }, []);

  // Fetch map detail (cards, connections, documentUrl) + cek lock untuk student
  useEffect(() => {
    if (!mapId || !token) return;

    setLoadingMap(true);
    getMapDetail(token, mapId)
      .then(async (res) => {
        const map = res.data as any;

        if (map.documentUrl) setDocUrl(map.documentUrl);

        // Selalu load kartu
        if (map.cards && map.cards.length > 0) {
          setCards(
            map.cards.map((c: any) => ({
              id: c.id,
              text: c.text,
              column: c.column.toLowerCase() as ColumnType,
            }))
          );
        }

        if (role === "TEACHER" && map.connections && map.connections.length > 0) {
          setConnections(
            map.connections.map((conn: any) => ({
              id: conn.id,
              fromId: conn.fromId,
              toId: conn.toId,
            }))
          );
        }

        // Kalau student sudah pernah submit → fetch hasil dari backend (dengan correctAnswers dari guru)
        if (role === "STUDENT" && map.submissions && map.submissions.length > 0) {
          try {
            const result = await getMySubmissionResult(token!, mapId!);

            const studentConns: ConnectionType[] = result.answers.map((a, i) => ({
              id: `ans_${i}`,
              fromId: a.fromId,
              toId: a.toId,
            }));

            const correctSet = new Set<string>();
            studentConns.forEach((conn) => {
              const isCorrect = result.correctAnswers.some(
                (ca) => ca.fromId === conn.fromId && ca.toId === conn.toId
              );
              if (isCorrect) correctSet.add(conn.id);
            });

            setConnections(studentConns);
            setCorrectConnIds(correctSet);
            setReviewMode(true);
          } catch {
            // Jika gagal fetch hasil, biarkan student mengerjakan ulang (tidak seharusnya terjadi)
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingMap(false));
  }, [mapId, token, role]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setConnectingFrom(null); };
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
      (c) => (c.fromId === connectingFrom.cardId && c.toId === targetId) || (c.fromId === targetId && c.toId === connectingFrom.cardId)
    );
    const sourceHasOutgoing = connections.some((c) => c.fromId === connectingFrom.cardId);

    if (!alreadyConnected && !sourceHasOutgoing) {
      setConnections((prev) => [...prev, { id: uid(), fromId: connectingFrom.cardId, toId: targetId }]);

      // Capture positions BEFORE updating cards (for FLIP animation)
      capturePositions();

      setCards((prev) => {
        const sourceColCards = prev.filter((c) => c.column === connectingFrom.column);
        const sourceIndex = sourceColCards.findIndex((c) => c.id === connectingFrom.cardId);
        const targetColCards = prev.filter((c) => c.column === targetCol);
        const targetIndex = targetColCards.findIndex((c) => c.id === targetId);
        if (sourceIndex === -1 || targetIndex === -1 || targetIndex === sourceIndex) return prev;
        const newTargetColCards = [...targetColCards];
        const [moved] = newTargetColCards.splice(targetIndex, 1);
        newTargetColCards.splice(sourceIndex, 0, moved);
        return prev.filter((c) => c.column !== targetCol).concat(newTargetColCards);
      });

      // Schedule animation after React re-renders
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          animateCards();
        });
      });

      showToast("Koneksi berhasil dibuat!");
    } else if (sourceHasOutgoing) {
      showToast("Kartu ini sudah memiliki koneksi.");
    } else {
      showToast("Koneksi sudah ada.");
    }
    setConnectingFrom(null);
  }, [connectingFrom, connections, showToast, capturePositions, animateCards]);

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

  // TEACHER SUBMIT
  const handleTeacherSubmit = useCallback(async () => {
    if (!token || !mapId) return;
    if (cards.length === 0) { showToast("Tambahkan minimal satu kartu terlebih dahulu."); return; }
    if (connections.length === 0) { showToast("Buat minimal satu koneksi terlebih dahulu."); return; }

    setSubmitting(true);
    try {
      const cardPayload: CardPayloadItem[] = cards.map((c) => ({
        text: c.text,
        column: c.column.toUpperCase() as "CLAIM" | "EVIDENCE" | "REASONING",
      }));
      const cardRes = await createCards(token, mapId, cardPayload);
      const savedCards = cardRes.data;

      const localToServer = new Map<string, string>();
      cards.forEach((localCard) => {
        const serverCard = savedCards.find(
          (s) => s.text === localCard.text && s.column.toLowerCase() === localCard.column
        );
        if (serverCard) localToServer.set(localCard.id, serverCard.id);
      });

      const connPayload: ConnectionPayloadItem[] = connections
        .map((c) => ({ fromId: localToServer.get(c.fromId) ?? "", toId: localToServer.get(c.toId) ?? "" }))
        .filter((c) => c.fromId && c.toId);

      await createConnections(token, mapId, connPayload);
      setTeacherSubmitted(true);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Gagal menyimpan CER.");
    } finally {
      setSubmitting(false);
    }
  }, [token, mapId, cards, connections, showToast]);

  // STUDENT SUBMIT
  const handleStudentSubmit = useCallback(async () => {
    if (!token || !mapId) return;
    if (connections.length === 0) { showToast("Buat minimal satu koneksi terlebih dahulu."); return; }

    setSubmitting(true);
    try {
      // Student cards pakai server ID langsung (tidak ada local→server mapping seperti teacher)
      // karena student tidak buat kartu baru, kartu sudah ada di DB
      const answers: ConnectionPayloadItem[] = connections.map((c) => ({ fromId: c.fromId, toId: c.toId }));
      const res = await submitAnswers(token, { mapId, answers });
      const { score, correctAnswers } = res.data;
      const total = connections.length;
      const correct = correctAnswers.length;
      // Simpan correctPairs dalam bentuk server ID (sudah benar dari backend)
      setCorrectPairs(correctAnswers);
      setStudentResult({ score, correct, total });
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Gagal submit jawaban.");
    } finally {
      setSubmitting(false);
    }
  }, [token, mapId, connections, showToast]);

  const handleStudentModalClose = useCallback(() => {
    if (!studentResult) return;
    const correctSet = new Set<string>();
    for (const pair of correctPairs) {
      const conn = connections.find((c) => c.fromId === pair.fromId && c.toId === pair.toId);
      if (conn) correctSet.add(conn.id);
    }
    setCorrectConnIds(correctSet);
    setStudentResult(null);
    setReviewMode(true);
  }, [studentResult, correctPairs, connections]);

  return (
    <>
      {/* Top Bar */}
      <div className="sticky top-[52px] z-30 bg-white border-b border-gray-200 flex items-center gap-3 px-6 py-2.5">
        
        {docUrl && (
          <button
            onClick={() => setShowDocPreview(true)}
            className="flex items-center gap-1.5 text-[12.5px] text-[#4A9E8E] hover:bg-[#4A9E8E]/10 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
            Baca Materi
          </button>
        )}

        {role === "TEACHER" && mapId && (
          <button
            onClick={() => setShowSubmissions(true)}
            className="flex items-center gap-1.5 text-[12.5px] text-[#7A5CAD] hover:bg-[#9B7CC4]/10 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Hasil Siswa
          </button>
        )}

        <div className="flex-1" />

        {reviewMode && (
          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
            Mode Review — Hijau: Benar · Merah: Salah
          </span>
        )}

        {role === "TEACHER" && !reviewMode && (
          <button
            onClick={handleTeacherSubmit}
            disabled={submitting}
            className="flex items-center gap-1.5 h-[32px] px-4 rounded-lg bg-[#4A9E8E] text-white text-[12.5px] font-medium hover:bg-[#3d8a7c] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Menyimpan..." : (<><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Submit CER</>)}
          </button>
        )}

        {role === "STUDENT" && !reviewMode && (
          <button
            onClick={handleStudentSubmit}
            disabled={submitting}
            className="flex items-center gap-1.5 h-[32px] px-4 rounded-lg bg-blue-600 text-white text-[12.5px] font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Mengirim..." : (<><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Submit Jawaban</>)}
          </button>
        )}
      </div>

      {connectingFrom && (
        <div
          className="fixed top-[96px] left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full text-white text-sm font-bold shadow-lg cursor-pointer select-none"
          style={{ background: "#5BA8D4", boxShadow: "0 4px 20px rgba(91,168,212,0.4)" }}
          onClick={() => setConnectingFrom(null)}
        >
          Pilih kartu {COL_DEFS.find(c => c.id === connectingFrom.column)?.canConnectTo} yang ingin dihubungkan &nbsp;·&nbsp; Klik di sini untuk batal
        </div>
      )}

      <div className="flex gap-16 p-6 items-start min-h-screen bg-[#F2F4F8]">
        {COL_DEFS.map((colDef) => {
          const colCards = cards.filter((c) => c.column === colDef.id);
          return (
            // Wrapper div with ref for FLIP animation targeting
            <div
              key={colDef.id}
              ref={colRefs[colDef.id] as React.RefObject<HTMLDivElement>}
              className="flex-1 min-w-0"
            >
              <Column
                colDef={colDef}
                cards={colCards}
                connections={connections}
                connectingFrom={connectingFrom}
                onCardClick={handleCardClick}
                onStartConnect={handleStartConnect}
                onRemoveConnection={reviewMode ? () => {} : handleRemoveConnection}
                onDeleteCard={reviewMode ? () => {} : handleDeleteCard}
                onAddCard={reviewMode ? () => {} : () => setAddModalCol(colDef.id)}
                reviewMode={reviewMode}
                correctConnIds={correctConnIds}
                isTeacher={role === "TEACHER"}
              />
            </div>
          );
        })}
      </div>

      <ConnectionsLayer
        connections={connections}
        onRemove={reviewMode ? () => {} : handleRemoveConnection}
        reviewMode={reviewMode}
        correctConnIds={correctConnIds}
      />

      {addModalCol && (
        <AddCardModal column={addModalCol} onConfirm={handleAddCard} onClose={() => setAddModalCol(null)} />
      )}

      {toast && <Toast message={toast} />}

      {showBackConfirm && (
        <BackConfirmModal onConfirm={() => router.push("/maps")} onCancel={() => setShowBackConfirm(false)} />
      )}

      {showDocPreview && docUrl && (
        <DocumentPreviewModal url={docUrl} onClose={() => setShowDocPreview(false)} />
      )}

      {showSubmissions && mapId && (
        <StudentSubmissionsModal mapId={mapId} onClose={() => setShowSubmissions(false)} />
      )}

      {teacherSubmitted && (
        <TeacherSubmitModal onClose={() => setTeacherSubmitted(false)} />
      )}

      {studentResult && (
        <StudentResultModal
          score={studentResult.score}
          correct={studentResult.correct}
          total={studentResult.total}
          onClose={handleStudentModalClose}
        />
      )}
    </>
  );
}