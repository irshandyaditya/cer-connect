"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/store/auth-store";

const NAV_LINKS = [{ href: "/maps", label: "Daftar Map" }];

export default function AppHeader() {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, role, clearAuth } = useAuth();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Disable "Daftar Map" link when inside /cer
  const isInsideCer = pathname.startsWith("/cer");

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleLogout() {
    clearAuth();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 h-[52px] flex items-center justify-between px-6">
      {/* Left: brand + nav */}
      <div className="flex items-center gap-6">
        <Link href="/maps" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#4A9E8E] flex items-center justify-center text-white text-[13px] font-medium">
            C
          </div>
          <span className="text-[14px] font-medium text-gray-900 tracking-tight">
            CER Connect
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            const disabled = isInsideCer && link.href === "/maps";

            if (disabled) {
              return (
                <span
                  key={link.href}
                  title="Kembali ke halaman sebelumnya untuk mengakses Daftar Map"
                  className="text-[13px] px-2.5 py-1 rounded-md text-gray-300 cursor-not-allowed select-none"
                >
                  {link.label}
                </span>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[13px] px-2.5 py-1 rounded-md transition-colors ${
                  active
                    ? "bg-[#4A9E8E]/10 text-[#4A9E8E] font-medium"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: profile dropdown */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[13px] text-gray-500 hover:bg-gray-100 transition-colors"
        >
          Halo,&nbsp;
          <span className="font-medium text-gray-900">{user?.fullName ?? "..."}</span>
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-dropdown">
            <div className="px-4 py-2.5 border-b border-gray-100">
              <p className="text-[11px] text-gray-400 mb-0.5">Masuk sebagai</p>
              <p className="text-[13px] font-medium text-gray-900 truncate">{user?.fullName}</p>
              <span className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                role === "TEACHER"
                  ? "bg-[#4A9E8E]/10 text-[#4A9E8E]"
                  : "bg-blue-50 text-blue-600"
              }`}>
                {role === "TEACHER" ? "Dosen" : "Mahasiswa"}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors text-left"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Keluar
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes dropdown-in {
          from { opacity: 0; transform: translateY(-6px) scale(.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        .animate-dropdown { animation: dropdown-in .14s ease both; }
      `}</style>
    </header>
  );
}