"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { useAuth } from "@/store/auth-store";
import "./login.css";

// ── Constants ──────────────────────────────────────────────────────────

const PILLARS = [
  { key: "c", letter: "C", label: "Claim",     desc: "Pernyataan utama yang ingin dibuktikan" },
  { key: "e", letter: "E", label: "Evidence",  desc: "Data dan fakta pendukung argumen" },
  { key: "r", letter: "R", label: "Reasoning", desc: "Penjelasan logis yang menghubungkan keduanya" },
];

// ── Page ───────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router        = useRouter();
  const { setAuth }   = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername]         = useState("");
  const [password, setPassword]         = useState("");
  const [loading, setLoading]           = useState(false);
  const [shaking, setShaking]           = useState(false);
  const [errorMsg, setErrorMsg]         = useState<string | null>(null);

  async function handleLogin() {
    setErrorMsg(null);

    if (!username.trim() || !password) {
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      return;
    }

    setLoading(true);
    try {
      const res = await login({ username: username.trim(), password });
      setAuth(res.data.token, res.data.user);
      router.push("/maps");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setErrorMsg(msg);
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-root">
      {/* ── Left Panel ── */}
      <div className="login-left">
        <div className="geo-ring geo-ring--large" />
        <div className="geo-ring geo-ring--medium" />
        <div className="geo-ring geo-ring--small" />

        <div className="left-top">
          <div className="brand">
            <div className="brand-mark">C</div>
            <span className="brand-name">CER Connect</span>
          </div>
          <h1 className="hero-title">
            Bangun argumen<br />
            yang <em>kuat</em> dan<br />
            terstruktur.
          </h1>
          <p className="hero-desc">
            Platform kolaborasi akademik untuk menyusun Claim, Evidence,
            dan Reasoning secara visual dan sistematis.
          </p>
        </div>

        <div className="pillars">
          {PILLARS.map((p) => (
            <div key={p.key} className="pillar">
              <div className={`pillar-letter pillar-letter--${p.key}`}>{p.letter}</div>
              <div>
                <span className="pillar-label">{p.label}</span>
                <span className="pillar-desc">{p.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="login-right">
        <div className={`form-area ${shaking ? "shake" : ""}`}>
          <p className="form-eyebrow">Selamat datang kembali</p>
          <h2 className="form-title">
            Masuk ke akun<br />Anda
          </h2>
          <p className="form-sub">
            Lanjutkan sesi belajar dan eksplorasi<br />
            argumen Anda hari ini.
          </p>

          {/* Error banner */}
          {errorMsg && (
            <div className="error-banner" role="alert">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {errorMsg}
            </div>
          )}

          {/* Username field */}
          <div className="field">
            <label className="field-label" htmlFor="username">Username</label>
            <div className="input-wrap">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                id="username"
                type="text"
                className="cer-input"
                placeholder="Masukkan username Anda"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
          </div>

          {/* Password field */}
          <div className="field">
            <label className="field-label" htmlFor="password">Password</label>
            <div className="input-wrap">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="cer-input"
                placeholder="Masukkan password Anda"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <button
                type="button"
                className="toggle-pw"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            className={`btn-login ${loading ? "btn-login--loading" : ""}`}
            disabled={loading}
            onClick={handleLogin}
          >
            <span className={`btn-login-text ${loading ? "btn-login-text--hidden" : ""}`}>
              Masuk Sekarang
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}