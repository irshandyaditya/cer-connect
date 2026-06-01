"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getMaps, createMap, MapItem, CreateMapPayload, GroupItem, getGroups } from "@/lib/api";
import { useAuth } from "@/store/auth-store";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatTimeout(iso: string) {
  const d = new Date(iso);
  const expired = d < new Date();
  return {
    label: d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
    expired,
  };
}

export default function MapsClient() {
  const router              = useRouter();
  const { token, role, groupId } = useAuth();

  const [maps, setMaps]       = useState<MapItem[]>([]);
  const [query, setQuery]     = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const [groups, setGroups] = useState<GroupItem[]>([]);

  const fetchMaps = useCallback(async () => {
    if (!token) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const mapsRes = await getMaps(token);

      setMaps(mapsRes.data);

      if (role === "TEACHER") {
        const groupsRes = await getGroups(token);
        setGroups(groupsRes.data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, [token, router, role]);

  useEffect(() => { fetchMaps(); }, [fetchMaps]);

  const q = query.toLowerCase();
  const filtered = maps.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      (m.description ?? "").toLowerCase().includes(q)
  );

  return (
    <div className="max-w-[760px] mx-auto px-6 py-9">

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[20px] font-medium text-gray-900">Daftar Map</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Pilih map untuk mulai menyusun argumen Claim–Evidence–Reasoning.
          </p>
        </div>

        {role === "TEACHER" && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 h-[34px] px-4 rounded-lg bg-[#1C1C2E] text-white text-[12.5px] font-medium hover:bg-[#2d2d44] transition-colors flex-shrink-0"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Tambah Map
          </button>
        )}
      </div>

      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Cari judul atau deskripsi..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-[38px] pl-9 pr-4 text-[13px] bg-white border border-gray-200 rounded-lg
            text-gray-900 placeholder-gray-400 outline-none
            focus:border-[#4A9E8E] focus:ring-2 focus:ring-[#4A9E8E]/15 transition"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-[13px]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
          <button onClick={fetchMaps} className="ml-auto text-[12px] underline">Coba lagi</button>
        </div>
      )}

      {!loading && (
        <p className="text-[12px] text-gray-400 mb-3">
          Menampilkan {filtered.length} dari {maps.length} map
        </p>
      )}

      {loading ? (
        <div className="flex flex-col gap-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[110px] rounded-xl bg-white border border-gray-200 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          <p className="text-[13px]">Tidak ada map yang cocok.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((map) => {
            const groupName = groups.find((g) => g.id === map.groupId)?.name ?? "\u2014";
            return (
              <MapCard
                key={map.id}
                map={map}
                isTeacher={role === "TEACHER"}
                groupName={groupName}
                onOpenCer={() => router.push(`/cer?mapId=${map.id}`)}
                onOpenGrades={() => router.push(`/grades/${map.id}`)}
              />
            );
          })}
        </div>
      )}

      {showAdd && (
        <AddMapModal
          groups={groups}
          defaultGroupId={groupId ?? ""}
          token={token!}
          onClose={() => setShowAdd(false)}
          onCreated={() => {
            setShowAdd(false);
            fetchMaps();
          }}
        />
      )}

    </div>
  );
}

function MapCard({
  map, isTeacher, groupName, onOpenCer, onOpenGrades,
}: {
  map: MapItem;
  isTeacher: boolean;
  groupName: string;
  onOpenCer: () => void;
  onOpenGrades: () => void;
}) {
  const timeout = formatTimeout(map.timeoutAt);

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 hover:-translate-y-px hover:shadow-md transition-all duration-150 px-5 py-4 flex items-start gap-4">
      {/* \u2014 Info kiri \u2014 */}
      <div className="flex-1 min-w-0">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#4A9E8E] bg-[#4A9E8E]/10 px-2.5 py-0.5 rounded-full mb-2">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          {map.createdBy.fullName}
        </span>

        <p className="text-[14px] font-medium truncate mb-1 text-gray-900">{map.title}</p>

        {map.description && (
          <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2 mb-2">
            {map.description}
          </p>
        )}

        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
          timeout.expired ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-600"
        }`}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          {timeout.expired ? "Berakhir" : "Tenggat"}: {timeout.label}
        </span>
      </div>

      {/* \u2014 Aksi kanan \u2014 */}
      <div className="flex flex-col items-end justify-between gap-3 self-stretch flex-shrink-0">
        <span className="text-[11px] text-gray-400 whitespace-nowrap">{formatDate(map.createdAt)}</span>

        {isTeacher ? (
          <div className="flex items-center gap-2">
            {/* Tombol Nilai */}
            <button
              onClick={onOpenGrades}
              title="Lihat nilai siswa"
              className="flex items-center gap-1.5 h-[30px] px-3 rounded-lg border border-gray-200 bg-white text-[11.5px] font-medium text-gray-600 hover:border-[#4A9E8E] hover:text-[#4A9E8E] hover:bg-[#4A9E8E]/5 transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              Nilai
            </button>

            {/* Tombol Buka CER */}
            <button
              onClick={onOpenCer}
              title="Buka map CER"
              className="flex items-center gap-1.5 h-[30px] px-3 rounded-lg bg-[#1C1C2E] text-white text-[11.5px] font-medium hover:bg-[#2d2d44] transition-colors"
            >
              Buka Map
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenCer}
            className="w-8 h-8 rounded-full flex items-center justify-center border bg-gray-100 border-gray-200 text-gray-400 hover:bg-[#4A9E8E] hover:border-[#4A9E8E] hover:text-white transition-all duration-150"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

type AddMapForm = {
  title: string;
  description: string;
  document: File | null;
  timeoutAt: string;
  groupId: string;
};

function AddMapModal({
  groups, defaultGroupId, token, onClose, onCreated,
}: {
  groups: GroupItem[], defaultGroupId: string; token: string; onClose: () => void; onCreated: () => void;
}) {
  const [form, setForm] = useState<AddMapForm>({
    title: "",
    description: "",
    document: null,
    timeoutAt: "",
    groupId: defaultGroupId,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  function update(field: keyof AddMapForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.title.trim() || !form.timeoutAt || !form.groupId.trim()) {
      setError("Judul, tenggat waktu, dan group wajib diisi.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: CreateMapPayload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        document: form.document,
        timeoutAt: new Date(form.timeoutAt).toISOString(),
        groupId: form.groupId,
      };

      await createMap(token, payload);

      onCreated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal membuat map.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-semibold text-gray-900">Tambah Map Baru</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-[13px]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}
          <ModalField label="Judul *" value={form.title} onChange={(v) => update("title", v)} placeholder="Contoh: Relational Database" />
          <ModalField label="Deskripsi" value={form.description} onChange={(v) => update("description", v)} placeholder="Deskripsi singkat materi..." textarea />
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wide text-gray-500 mb-1.5">
              Dokumen
            </label>

            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;

                setForm((f) => ({
                  ...f,
                  document: file,
                }));
              }}
              className="w-full h-[40px] py-1 px-3 text-[13px] border border-gray-200 rounded-lg text-gray-700 file:mr-3 file:border-0 file:bg-[#1C1C2E] file:text-white file:px-3 file:h-[28px] file:rounded-md file:text-[12px]"
            />

            {form.document && (
              <p className="mt-2 text-[12px] text-gray-500">
                {form.document.name}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wide text-gray-500 mb-1.5">
              Group *
            </label>

            <select
              value={form.groupId}
              onChange={(e) => update("groupId", e.target.value)}
              className="w-full h-[40px] px-3 text-[13.5px] border border-gray-200 rounded-lg text-gray-800 outline-none focus:border-[#4A9E8E] focus:ring-2 focus:ring-[#4A9E8E]/15 transition"
            >
              <option value="">Pilih Group</option>

              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          <ModalField label="Tenggat Waktu *" value={form.timeoutAt} onChange={(v) => update("timeoutAt", v)} type="datetime-local" />
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="h-[36px] px-4 rounded-lg border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-100 transition-colors">
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="h-[36px] px-5 rounded-lg bg-[#1C1C2E] text-white text-[13px] font-medium hover:bg-[#2d2d44] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Menyimpan..." : "Simpan Map"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalField({
  label, value, onChange, placeholder, type = "text", textarea = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; textarea?: boolean;
}) {
  const base = "w-full px-3 text-[13.5px] border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 outline-none focus:border-[#4A9E8E] focus:ring-2 focus:ring-[#4A9E8E]/15 transition";
  return (
    <div>
      <label className="block text-[11px] font-medium uppercase tracking-wide text-gray-500 mb-1.5">{label}</label>
      {textarea ? (
        <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${base} py-2 resize-none`} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${base} h-[40px]`} />
      )}
    </div>
  );
}