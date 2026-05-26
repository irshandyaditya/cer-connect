"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMapSubmissions, getMapDetail, SubmissionEntry } from "@/lib/api";
import { useAuth } from "@/store/auth-store";

function scoreBg(score: number | null): { color: string; bg: string } {
  if (score === null) return { color: "#9ca3af", bg: "#f9fafb" };
  if (score >= 80)    return { color: "#16a34a", bg: "#f0fdf4" };
  if (score >= 50)    return { color: "#d97706", bg: "#fffbeb" };
  return               { color: "#dc2626", bg: "#fef2f2" };
}

export default function GradesClient() {
  const { mapId } = useParams<{ mapId: string }>();
  const router = useRouter();
  const { token, role } = useAuth();

  const [submissions, setSubmissions] = useState<SubmissionEntry[]>([]);
  const [mapTitle, setMapTitle]       = useState<string>("");
  const [groupName, setGroupName]     = useState<string>("");
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);

  useEffect(() => {
    if (!token) { router.replace("/login"); return; }
    if (role !== "TEACHER") { router.replace("/maps"); return; }

    setLoading(true);
    setError(null);

    Promise.all([
      getMapDetail(token, mapId),
      getMapSubmissions(token, mapId),
    ])
      .then(([mapRes, subRes]) => {
        setMapTitle(mapRes.data.title);
        // groupName dari submission pertama, atau fallback groupId
        const firstGroup = subRes.data[0]?.user?.group?.name;
        setGroupName(firstGroup ?? mapRes.data.group?.name);
        setSubmissions(subRes.data);
      })
      .catch((err) => setError(err.message ?? "Gagal memuat data."))
      .finally(() => setLoading(false));
  }, [token, mapId, role, router]);

  const scored = submissions.filter((s) => s.score !== null);
  const avg =
    scored.length > 0
      ? (scored.reduce((sum, s) => sum + (s.score ?? 0), 0) / scored.length).toFixed(1)
      : null;

  const avgScore = avg !== null ? parseFloat(avg) : null;
  const { color: avgColor, bg: avgBg } = scoreBg(avgScore);

  return (
    <div className="max-w-[760px] mx-auto px-6 py-9">

      {/* ── Back + Header ── */}
      <div className="mb-7">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-[12.5px] text-gray-400 hover:text-gray-600 transition-colors mb-5"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Kembali ke Daftar Map
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-block text-[11px] font-medium uppercase tracking-wide text-[#4A9E8E] mb-1.5">
              Rekap Nilai
            </span>
            {loading ? (
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-1" />
            ) : (
              <h1 className="text-[20px] font-semibold text-gray-900 leading-snug mb-1">
                {mapTitle}
              </h1>
            )}
            <div className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span className="text-[12.5px] text-gray-400">
                {loading ? "Memuat..." : groupName}
              </span>
            </div>
          </div>

          {/* Stat rata-rata */}
          {!loading && !error && avg !== null && (
            <div className="flex-shrink-0 text-right">
              <p className="text-[11px] text-gray-400 mb-1">Rata-rata Kelas</p>
              <span
                className="text-[22px] font-bold px-4 py-1 rounded-xl"
                style={{ color: avgColor, background: avgBg }}
              >
                {avg}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2 p-3 mb-5 rounded-lg bg-red-50 border border-red-100 text-red-600 text-[13px]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
          <button onClick={() => router.refresh()} className="ml-auto text-[12px] underline">Coba lagi</button>
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div className="h-3.5 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 last:border-0">
              <div className="w-5 h-3 bg-gray-100 rounded animate-pulse" />
              <div className="flex-1 h-4 bg-gray-100 rounded animate-pulse" />
              <div className="w-24 h-3 bg-gray-100 rounded animate-pulse" />
              <div className="w-10 h-5 bg-gray-100 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && submissions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          <p className="text-[13px]">Belum ada siswa yang mengumpulkan.</p>
        </div>
      )}

      {/* ── Tabel nilai ── */}
      {!loading && !error && submissions.length > 0 && (
        <>
          <p className="text-[12px] text-gray-400 mb-3">
            {submissions.length} siswa mengumpulkan
            {scored.length < submissions.length && (
              <span className="text-amber-500"> · {submissions.length - scored.length} belum dinilai</span>
            )}
          </p>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 w-10 text-center">
                    No
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Nama Siswa
                  </th>
                  <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    NIM
                  </th>
                  <th className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 text-center">
                    Nilai
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {submissions.map((sub, i) => {
                  const { color, bg } = scoreBg(sub.score);
                  return (
                    <tr key={sub.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4 text-[12px] text-gray-300 font-medium text-center">
                        {i + 1}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-[13.5px] font-medium text-gray-800">
                          {sub.user.fullName}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-[12.5px] text-gray-500 font-mono">
                          {sub.user.username}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {sub.score !== null ? (
                          <span
                            className="inline-block text-[12.5px] font-bold px-3 py-0.5 rounded-full"
                            style={{ color, background: bg }}
                          >
                            {Math.round(sub.score)}
                          </span>
                        ) : (
                          <span className="text-[12px] text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* ── Footer rata-rata ── */}
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-200">
                  <td colSpan={3} className="px-5 py-4 text-[12.5px] font-semibold text-gray-600 text-right">
                    Rata-rata Nilai
                  </td>
                  <td className="px-6 py-4 text-center">
                    {avg !== null ? (
                      <span
                        className="inline-block text-[13px] font-bold px-3 py-0.5 rounded-full"
                        style={{ color: avgColor, background: avgBg }}
                      >
                        {avg}
                      </span>
                    ) : (
                      <span className="text-[12px] text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
}