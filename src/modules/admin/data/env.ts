export type AdminEnv = {
  url: string;
  anonKey: string;
  brandSlug: string;
};

const REQUIRED_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "BRAND_SLUG",
] as const;

export function adminEnvStatus(): { configured: boolean; missing: string[] } {
  const missing = REQUIRED_KEYS.filter((key) => !process.env[key]?.trim());
  return { configured: missing.length === 0, missing: [...missing] };
}

export function readAdminEnv(): AdminEnv | null {
  if (!adminEnvStatus().configured) return null;
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
    brandSlug: process.env.BRAND_SLUG!.trim(),
  };
}

export function requireAdminEnv(): AdminEnv {
  const env = readAdminEnv();
  if (!env) {
    throw new Error(
      "Konfigurasi admin belum lengkap. Isi NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, dan BRAND_SLUG di .env.local.",
    );
  }
  return env;
}
