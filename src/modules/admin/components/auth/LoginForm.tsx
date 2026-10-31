"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
} from "../../icons";
import {
  loginAction,
  requestPasswordResetAction,
} from "../../data/auth-actions";
import type { LoginState } from "../../types";

function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="adm-btn adm-btn-block adm-login-submit"
      disabled={pending}
    >
      {pending ? <Loader2 size={18} className="adm-spin" /> : null}
      {pending ? pendingLabel : label}
    </button>
  );
}

export function LoginForm({ initialError }: { initialError?: string }) {
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginState, submitLogin] = useActionState(loginAction, {} as LoginState);
  const [resetState, submitReset] = useActionState(
    requestPasswordResetAction,
    {} as LoginState,
  );

  const activeState = mode === "login" ? loginState : resetState;
  const error = mode === "login" ? (loginState.error ?? initialError) : resetState.error;

  return (
    <div className="adm-login-form-wrap">
      <div className="adm-login-form-head">
        <h2>{mode === "login" ? "Masuk ke dashboard" : "Reset password"}</h2>
        <p>
          {mode === "login"
            ? "Gunakan akun admin yang sudah terdaftar."
            : "Masukkan email admin, kami kirim link reset lewat Supabase."}
        </p>
      </div>

      {error ? (
        <div className="adm-login-alert adm-login-alert-error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      ) : null}

      {mode === "reset" && resetState.success ? (
        <div className="adm-login-alert adm-login-alert-success" role="status">
          <CheckCircle2 size={18} />
          <span>{resetState.success}</span>
        </div>
      ) : null}

      {mode === "login" ? (
        <form action={submitLogin} className="adm-login-form">
          <label className="adm-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nama@brand.com"
              autoComplete="email"
              inputMode="email"
              required
              autoFocus
            />
          </label>

          <label className="adm-field">
            <span>Password</span>
            <span className="adm-password">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Masukkan password"
                autoComplete="current-password"
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

          <div className="adm-login-options">
            <label className="adm-check">
              <input type="checkbox" name="remember" defaultChecked />
              <span>Ingat saya</span>
            </label>
            <button
              type="button"
              className="adm-link-btn"
              onClick={() => setMode("reset")}
            >
              Lupa password?
            </button>
          </div>

          <SubmitButton label="Masuk" pendingLabel="Memeriksa akun..." />
        </form>
      ) : (
        <form action={submitReset} className="adm-login-form">
          <label className="adm-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nama@brand.com"
              autoComplete="email"
              inputMode="email"
              required
              autoFocus
            />
          </label>

          <SubmitButton label="Kirim link reset" pendingLabel="Mengirim..." />

          <button
            type="button"
            className="adm-link-btn adm-link-center"
            onClick={() => setMode("login")}
          >
            Kembali ke halaman masuk
          </button>
        </form>
      )}

      {activeState.success && mode === "login" ? (
        <p className="adm-login-note">{activeState.success}</p>
      ) : null}
    </div>
  );
}
