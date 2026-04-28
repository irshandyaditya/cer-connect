"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./login.css";

const PILLARS = [
  { key: "c", letter: "C", label: "Claim",     desc: "Pernyataan utama yang ingin dibuktikan" },
  { key: "e", letter: "E", label: "Evidence",  desc: "Data dan fakta pendukung argumen" },
  { key: "r", letter: "R", label: "Reasoning", desc: "Penjelasan logis yang menghubungkan keduanya" },
];

const ROLES = [
  { icon: "🎓", label: "Mahasiswa" },
  { icon: "👨‍🏫", label: "Dosen" },
];

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername]         = useState("");
  const [password, setPassword]         = useState("");
  const [loading, setLoading]           = useState(false);
  const [shaking, setShaking]           = useState(false);

  function handleLogin() {
    if (!username.trim() || !password) {
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      return;
    }
    setLoading(true);
    // TODO: ganti dengan logika auth kamu (NextAuth, JWT, dsb.)
    setTimeout(() => {
      setLoading(false);
      router.push("/cer");
    }, 1500);
  }

  return (
    <div className="login-root">
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

          {/* <div className="form-extras">
            <label className="remember">
              <input type="checkbox" className="remember-checkbox" />
              <span className="remember-label">Ingat saya</span>
            </label>
            <a href="#" className="forgot-link">Lupa password?</a>
          </div> */}

          <button
            className={`btn-login ${loading ? "btn-login--loading" : ""}`}
            disabled={loading}
            onClick={handleLogin}
          >
            <span className={`btn-login-text ${loading ? "btn-login-text--hidden" : ""}`}>
              Masuk Sekarang
            </span>
          </button>

          {/* <div className="divider">
            <div className="divider-line" />
            atau masuk sebagai
            <div className="divider-line" />
          </div>

          <div className="role-chips">
            {ROLES.map((r) => (
              <button key={r.label} className="role-chip">
                <span className="chip-icon">{r.icon}</span>
                {r.label}
              </button>
            ))}
          </div> */}

          {/* <div className="form-footer">
            Belum punya akun? <a href="#">Daftar di sini</a><br />
            Butuh bantuan? <a href="#">Hubungi administrator</a>
          </div> */}
        </div>
      </div>
    </div>
  );
}