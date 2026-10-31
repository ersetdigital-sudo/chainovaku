import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  accessErrorMessage,
  getLoginPageState,
} from "@/modules/admin/data/auth";
import {
  LoginScreen,
  LoginUnavailable,
} from "@/modules/admin/components/auth/LoginScreen";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Masuk",
  robots: { index: false, follow: false },
};

const ERROR_MESSAGES: Record<string, string> = {
  inactive: "Akun ini sudah dinonaktifkan.",
  no_access: "Akun ini tidak punya akses ke dashboard ini.",
  config: "Konfigurasi dashboard belum lengkap.",
  brand: "Brand untuk dashboard ini belum ditemukan.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const state = await getLoginPageState();

  if (state.user && state.access === "ok") {
    redirect("/admin");
  }

  const initialError =
    state.user && state.access && state.access !== "ok"
      ? accessErrorMessage(state.access)
      : params.error
        ? ERROR_MESSAGES[params.error]
        : undefined;

  if (!state.configured || !state.brand) {
    return (
      <LoginUnavailable
        missing={state.missing}
        brandMissing={state.configured && !state.brand}
      />
    );
  }

  return <LoginScreen brand={state.brand} initialError={initialError} />;
}
