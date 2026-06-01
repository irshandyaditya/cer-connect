"use client";

import { useEffect, useState } from "react";
import { getMapSubmissions, SubmissionEntry } from "@/lib/api";
import { useAuth } from "@/store/auth-store";

type Props = {
  mapId: string;
  onClose: () => void;
};

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-[12px] text-gray-400">—</span>;

  const pct = Math.round(score);
  const color =
    pct >= 80 ? "#22c55e" :
    pct >= 50 ? "#f59e0b" :
    "#ef4444";
  const bg =
    pct >= 80 ? "#f0fdf4" :
    pct >= 50 ? "#fffbeb" :
    "#fef2f2";

  return (
    <span
      className="inline-block text-[12px] font-semibold px-2.5 py-0.5 rounded-full"
      style={{ color, background: bg }}
    >
      {pct}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function StudentSubmissionsModal({ mapId, onClose }: Props) {
  const { token } = useAuth();
  const [submissions, setSubmissions] = useState<SubmissionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getMapSubmissions(token, mapId)
      .then((res) => setSubmissions(res.data))
      .catch((err) => setError(err.message ?? "Gagal memuat data."))
      .finally(() => setLoading(false));
  }, [token, mapId]);

  const avg =
    submissions.length > 0
      ? Math.round(submissions.reduce((s, x) => s + (x.score ?? 0), 0) / submissions.length)
      : null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-[420px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-[14px] font-semibold text-gray-900">Hasil Pengerjaan Siswa</p>
            {!loading && !error && (
              <p className="text-[11px] text-gray-400 mt-0.5">
                {submissions.length} siswa mengumpulkan
                {avg !== null && <> · Rata-rata <span className="font-medium text-gray-600">{avg}</span></>}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <div className="w-5 h-5 border-2 border-[#5BA8D4] border-t-transparent rounded-full animate-spin" />
              <p className="text-[12px] text-gray-400">Memuat data...</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center h-40 gap-2 px-6 text-center">
              <p className="text-[13px] text-red-500">{error}</p>
            </div>
          )}

          {!loading && !error && submissions.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 gap-2 px-6 text-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <p className="text-[13px] text-gray-400">Belum ada siswa yang mengumpulkan.</p>
            </div>
          )}

          {!loading && !error && submissions.length > 0 && (
            <ul className="divide-y divide-gray-50">
              {submissions.map((sub, i) => (
                <li key={sub.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  {/* Rank */}
                  <span className="w-5 text-[11px] text-gray-300 font-medium text-right shrink-0">{i + 1}</span>

                  {/* Avatar */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0"
                    style={{ background: avatarColor(sub.user.fullName) }}
                  >
                    {sub.user.fullName.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-gray-800 truncate">{sub.user.fullName}</p>
                    <p className="text-[11px] text-gray-400 truncate">
                      {sub.user.group?.name ?? sub.user.username} · {formatDate(sub.submittedAt)}
                    </p>
                  </div>

                  {/* Score */}
                  <ScoreBadge score={sub.score} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// Generate warna konsisten dari nama
function avatarColor(name: string): string {
  const COLORS = [
    "#5BA8D4", "#6BAA78", "#9B7CC4", "#E07B5A",
    "#4A9E8E", "#C4875A", "#7A7EC4", "#C45A8E",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}