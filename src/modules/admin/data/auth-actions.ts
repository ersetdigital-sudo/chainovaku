"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { LoginState } from "../types";
import {
  accessErrorMessage,
  getPublicBrand,
  resolveAccess,
} from "./auth";
import {
  clearRememberPreference,
  createServerSupabase,
  setRememberPreference,
} from "./supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mapSignInError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "Email atau password salah.";
  }
  if (lower.includes("email not confirmed")) {
    return "Email belum dikonfirmasi. Cek inbox email kamu.";
  }
  if (lower.includes("too many") || lower.includes("rate limit")) {
    return "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.";
  }
  return "Gagal masuk. Coba lagi.";
}

export async function loginAction(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "on";

  if (!EMAIL_RE.test(email)) {
    return { error: "Masukkan alamat email yang valid." };
  }
  if (!password) {
    return { error: "Password wajib diisi." };
  }

  try {
    const supabase = await createServerSupabase({ remember });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: mapSignInError(error.message) };
    }

    const user = data.user;
    if (!user) {
      return { error: "Gagal masuk. Coba lagi." };
    }

    const brand = await getPublicBrand();
    if (!brand) {
      await supabase.auth.signOut();
      await clearRememberPreference();
      return {
        error:
          "Dashboard belum bisa terhubung ke database. Pastikan migration sudah dijalankan.",
      };
    }

    const access = await resolveAccess(supabase, user.id, brand.id);
    if (access !== "ok") {
      await supabase.auth.signOut();
      await clearRememberPreference();
      return { error: accessErrorMessage(access) };
    }

    await setRememberPreference(remember);
  } catch {
    return {
      error:
        "Dashboard belum bisa terhubung ke database. Periksa konfigurasi Supabase.",
    };
  }

  redirect("/admin");
}

export async function requestPasswordResetAction(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { error: "Masukkan alamat email yang valid." };
  }

  try {
    const supabase = await createServerSupabase();
    const headerStore = await headers();
    const proto = headerStore.get("x-forwarded-proto") ?? "http";
    const host = headerStore.get("host");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
    const origin = siteUrl || (host ? `${proto}://${host}` : "");
    const redirectTo = origin ? `${origin}/admin/reset-password` : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      const lower = error.message.toLowerCase();
      if (lower.includes("too many") || lower.includes("rate limit")) {
        return {
          error: "Terlalu banyak permintaan. Coba lagi beberapa menit lagi.",
        };
      }
    }
  } catch {
    return {
      error: "Gagal mengirim email reset. Periksa konfigurasi Supabase.",
    };
  }

  return {
    success:
      "Kalau email terdaftar, link reset password sudah dikirim. Cek inbox atau folder spam.",
  };
}
