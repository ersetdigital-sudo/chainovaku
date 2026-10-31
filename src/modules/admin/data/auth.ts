import type { SupabaseClient, User } from "@supabase/supabase-js";
import { cache } from "react";
import { redirect } from "next/navigation";
import type {
  AccessState,
  AdminBrand,
  PublicBrand,
} from "../types";
import { adminEnvStatus, readAdminEnv } from "./env";
import {
  createAnonSupabase,
  createServerSupabase,
} from "./supabase/server";

export type AdminContext = {
  supabase: SupabaseClient;
  user: { id: string; email: string };
  brand: AdminBrand;
  isSuper: boolean;
};

export type LoginPageState = {
  configured: boolean;
  missing: string[];
  brand: PublicBrand | null;
  user: { id: string; email: string } | null;
  access: AccessState | null;
};

const PUBLIC_BRAND_COLUMNS =
  "id,nama,slug,domain,tagline,logo_url,warna_utama,wa_cs,qris_image_url,batas_bayar_menit,jam_cek_tagihan";

export const getPublicBrand = cache(async (): Promise<PublicBrand | null> => {
  const env = readAdminEnv();
  if (!env) return null;
  try {
    const supabase = createAnonSupabase();
    const { data, error } = await supabase
      .from("brands")
      .select(PUBLIC_BRAND_COLUMNS)
      .eq("slug", env.brandSlug)
      .maybeSingle();
    if (error || !data) return null;
    return data as PublicBrand;
  } catch {
    return null;
  }
});

export async function resolveAccess(
  supabase: SupabaseClient,
  userId: string,
  brandId: string,
): Promise<AccessState> {
  const { data, error } = await supabase.rpc("is_brand_admin", {
    p_brand_id: brandId,
  });
  if (error) throw error;
  if (data === true) return "ok";

  const { data: rows } = await supabase
    .from("admins")
    .select("brand_id,role,aktif")
    .eq("user_id", userId);

  const own = (rows ?? []) as {
    brand_id: string | null;
    role: string;
    aktif: boolean;
  }[];
  if (
    own.some(
      (row) =>
        !row.aktif &&
        (row.brand_id === brandId || row.role === "super_admin"),
    )
  ) {
    return "inactive";
  }
  return "no_access";
}

export function accessErrorMessage(access: AccessState): string {
  if (access === "inactive") return "Akun ini sudah dinonaktifkan.";
  return "Akun ini tidak punya akses ke dashboard ini.";
}

export async function getLoginPageState(): Promise<LoginPageState> {
  const status = adminEnvStatus();
  if (!status.configured) {
    return {
      configured: false,
      missing: status.missing,
      brand: null,
      user: null,
      access: null,
    };
  }

  const brand = await getPublicBrand();
  if (!brand) {
    return {
      configured: true,
      missing: [],
      brand: null,
      user: null,
      access: null,
    };
  }

  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        configured: true,
        missing: [],
        brand,
        user: null,
        access: null,
      };
    }
    const access = await resolveAccess(supabase, user.id, brand.id);
    return {
      configured: true,
      missing: [],
      brand,
      user: { id: user.id, email: user.email ?? "" },
      access,
    };
  } catch {
    return {
      configured: true,
      missing: [],
      brand,
      user: null,
      access: null,
    };
  }
}

export const requireAdmin = cache(async (): Promise<AdminContext> => {
  const status = adminEnvStatus();
  if (!status.configured) redirect("/admin/login?error=config");

  let supabase: SupabaseClient;
  let user: User | null = null;
  try {
    supabase = await createServerSupabase();
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    redirect("/admin/login?error=config");
  }

  if (!user) redirect("/admin/login");

  const brand = await getPublicBrand();
  if (!brand) redirect("/admin/login?error=brand");

  let access: AccessState;
  try {
    access = await resolveAccess(supabase, user.id, brand.id);
  } catch {
    redirect("/admin/login?error=config");
  }

  if (access === "inactive") {
    redirect("/admin/auth/sign-out?reason=inactive");
  }
  if (access !== "ok") {
    redirect("/admin/auth/sign-out?reason=no_access");
  }

  const { data: fullBrand, error: brandError } = await supabase
    .from("brands")
    .select("*")
    .eq("id", brand.id)
    .maybeSingle();
  if (brandError || !fullBrand) {
    redirect("/admin/auth/sign-out?reason=no_access");
  }

  const { data: isSuper } = await supabase.rpc("is_super_admin");

  return {
    supabase,
    user: { id: user.id, email: user.email ?? "" },
    brand: fullBrand as AdminBrand,
    isSuper: isSuper === true,
  };
});
