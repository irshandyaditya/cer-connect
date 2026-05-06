"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────────────
type MapItem = {
  id: string;
  title: string;
  description: string;
  groupName: string;
  updatedAt: string;
  cardCount: { claim: number; evidence: number; reasoning: number };
};

// ── Mock data — ganti dengan fetch dari API/DB kamu ───────────────────
const MOCK_MAPS: MapItem[] = [
  {
    id: "map-1",
    title: "Sistem Basis Data Relasional",
    description: "Analisis klaim tentang MySQL sebagai RDBMS terkemuka beserta bukti dan penalaran logisnya.",
    groupName: "Kelompok 1 — IF 2022 A",
    updatedAt: "2025-12-01",
    cardCount: { claim: 4, evidence: 4, reasoning: 4 },
  },
  {
    id: "map-2",
    title: "Dampak Kecerdasan Buatan terhadap Dunia Kerja",
    description: "Peta argumen mengenai bagaimana AI mengubah lanskap pekerjaan di era industri 4.0.",
    groupName: "Kelompok 3 — IF 2022 B",
    updatedAt: "2025-11-28",
    cardCount: { claim: 3, evidence: 5, reasoning: 3 },
  },
  {
    id: "map-3",
    title: "Efektivitas Pembelajaran Daring",
    description: "Kajian terhadap klaim-klaim tentang efektivitas e-learning dibandingkan pembelajaran tatap muka.",
    groupName: "Kelompok 2 — SI 2023 A",
    updatedAt: "2025-11-25",
    cardCount: { claim: 5, evidence: 6, reasoning: 5 },
  },
  {
    id: "map-4",
    title: "Keamanan Aplikasi Web Modern",
    description: "Argumentasi seputar praktik terbaik keamanan aplikasi web dan kerentanan yang umum ditemukan.",
    groupName: "Kelompok 4 — IF 2022 A",
    updatedAt: "2025-11-20",
    cardCount: { claim: 3, evidence: 4, reasoning: 3 },
  },
  {
    id: "map-5",
    title: "Penggunaan Energi Terbarukan di Indonesia",
    description: "Peta argumen mengenai potensi dan hambatan implementasi energi terbarukan di Indonesia.",
    groupName: "Kelompok 1 — TI 2023 B",
    updatedAt: "2025-11-18",
    cardCount: { claim: 6, evidence: 7, reasoning: 6 },
  },
];

// ── Helpers ───────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

const BADGE = {
  claim:     { bg: "bg-[#E8F4FD] text-[#3A8CC4]", dot: "bg-[#5BA8D4]" },
  evidence:  { bg: "bg-[#EAF3EC] text-[#4A8F5A]", dot: "bg-[#6BAA78]" },
  reasoning: { bg: "bg-[#EFE8F5] text-[#7A5CAD]", dot: "bg-[#9B7CC4]" },
} as const;

// ── Page ─────────────────────────────────────────────────────────────
export default function MapsClient() {
  const router  = useRouter();
  const [query, setQuery] = useState("");

  const q = query.toLowerCase();
  const filtered = MOCK_MAPS.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      m.groupName.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q)
  );

  return (
    <div className="max-w-[760px] mx-auto px-6 py-9">
      <h1 className="text-[20px] font-medium text-gray-900 mb-1">Daftar Map</h1>
      <p className="text-[13px] text-gray-500 mb-6">
        Pilih map untuk mulai menyusun argumen Claim–Evidence–Reasoning.
      </p>

      {/* Search */}
      <div className="relative mb-5">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Cari judul, kelompok, atau deskripsi..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-[38px] pl-9 pr-4 text-[13px] bg-white border border-gray-200 rounded-lg
            text-gray-900 placeholder-gray-400 outline-none
            focus:border-[#4A9E8E] focus:ring-2 focus:ring-[#4A9E8E]/15 transition"
        />
      </div>

      <p className="text-[12px] text-gray-400 mb-3">
        Menampilkan {filtered.length} dari {MOCK_MAPS.length} map
      </p>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          <p className="text-[13px]">Tidak ada map yang cocok.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((map) => (
            <MapCard key={map.id} map={map} onClick={() => router.push(`/cer`)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── MapCard ───────────────────────────────────────────────────────────
function MapCard({ map, onClick }: { map: MapItem; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`w-full text-left bg-white rounded-xl border flex items-center gap-4 px-5 py-4 outline-none
        focus-visible:ring-2 focus-visible:ring-[#4A9E8E]/40 transition-all duration-150
        ${hovered ? "border-gray-300 -translate-y-px shadow-md" : "border-gray-200 shadow-sm"}`}
    >
      {/* Body */}
      <div className="flex-1 min-w-0">
        {/* Group pill */}
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#4A9E8E] bg-[#4A9E8E]/10 px-2.5 py-0.5 rounded-full mb-2">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          {map.groupName}
        </span>

        {/* Title */}
        <p className={`text-[14px] font-medium truncate mb-1 transition-colors ${hovered ? "text-[#4A9E8E]" : "text-gray-900"}`}>
          {map.title}
        </p>

        {/* Description */}
        <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2 mb-3">
          {map.description}
        </p>

        {/* Card count badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(["claim", "evidence", "reasoning"] as const).map((col) => (
            <span key={col} className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full ${BADGE[col].bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${BADGE[col].dot}`} />
              {col.charAt(0).toUpperCase() + col.slice(1)}: {map.cardCount[col]}
            </span>
          ))}
        </div>
      </div>

      {/* Right: date + arrow */}
      <div className="flex flex-col items-end justify-between gap-3 self-stretch flex-shrink-0">
        <span className="text-[11px] text-gray-400 whitespace-nowrap">{formatDate(map.updatedAt)}</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-150
          ${hovered ? "bg-[#4A9E8E] border-[#4A9E8E] text-white" : "bg-gray-100 border-gray-200 text-gray-400"}`}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </div>
      </div>
    </button>
  );
}