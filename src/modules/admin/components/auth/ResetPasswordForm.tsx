"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createAdminBrowserClient } from "../../data/supabase/browser";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
} from "../../icons";
import type { PublicBrand } from "../../types";
import { BrandMark } from "../ui/BrandMark";

type ResetState = "checking" | "ready" | "invalid" | "success";

export function ResetPasswordForm({ brand }: { brand: PublicBrand | null }) {
  const [state, setState] = useState<ResetState>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const supabase = useMemo(() => createAdminBrowserClient(), []);

  useEffect(() => {
    if (!supabase) {
      setState("invalid");
      return;
    }

    let active = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active && session) setState("ready");
    });

    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) setState("ready");
    });

    const timer = window.setTimeout(() => {
      if (active) {
        setState((current) => (current === "checking" ? "invalid" : current));
      }
    }, 2500);

    return () => {
      active = false;
      window.clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!supabase) {
      setError("Konfigurasi Supabase belum lengkap.");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    setPending(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setPending(false);

    if (updateError) {
      setError("Gagal menyimpan password baru. Link mungkin sudah kedaluwarsa.");
      return;
    }

    await supabase.auth.signOut();
    setState("success");
  }

  return (
    <div className="adm-login-unavailable adm-reset-page">
      <div className="adm-login-card adm-reset-card">
        <div className="adm-reset-brand">
          <BrandMark
            name={brand?.nama ?? "Admin Panel"}
            logoUrl={brand?.logo_url}
            color={brand?.warna_utama}
            size="md"
          />
          <b>{brand?.nama ?? "Admin Panel"}</b>
        </div>

        <span className="adm-empty-icon">
          <LockKeyhole size={24} />
        </span>
        <h1>Buat password baru</h1>

        {state === "checking" ? (
          <div className="adm-login-alert adm-login-alert-success">
            <Loader2 size={18} className="adm-spin" />
            <span>Memeriksa link reset...</span>
          </div>
        ) : null}

        {state === "invalid" ? (
          <>
            <p>
              Link reset tidak valid atau sudah kedaluwarsa. Minta link baru dari
              halaman login.
            </p>
            <Link href="/admin/login" className="adm-btn adm-btn-block">
              Kembali ke halaman login
            </Link>
          </>
        ) : null}

        {state === "success" ? (
          <>
            <div className="adm-login-alert adm-login-alert-success">
              <CheckCircle2 size={18} />
              <span>Password berhasil diperbarui.</span>
            </div>
            <p>Silakan masuk kembali dengan password baru.</p>
            <Link href="/admin/login" className="adm-btn adm-btn-block">
              Masuk ke dashboard
            </Link>
          </>
        ) : null}

        {state === "ready" ? (
          <form className="adm-login-form" onSubmit={handleSubmit}>
            {error ? (
              <div className="adm-login-alert adm-login-alert-error" role="alert">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            ) : null}

            <label className="adm-field">
              <span>Password baru</span>
              <span className="adm-password">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minimal 6 karakter"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="adm-password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Sembunyikan password" : "Lihat password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  <span>{showPassword ? "Tutup" : "Lihat"}</span>
                </button>
              </span>
            </label>

            <label className="adm-field">
              <span>Ulangi password baru</span>
              <input
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                placeholder="Ulangi password"
                autoComplete="new-password"
                required
              />
            </label>

            <button
              type="submit"
              className="adm-btn adm-btn-block"
              disabled={pending}
            >
              {pending ? <Loader2 size={18} className="adm-spin" /> : null}
              {pending ? "Menyimpan..." : "Simpan password baru"}
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
