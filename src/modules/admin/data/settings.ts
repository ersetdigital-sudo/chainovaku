import type { SupabaseClient } from "@supabase/supabase-js";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "../constants";
import { fileExtension } from "../lib/utils";
import type { PaymentMethodRow } from "../types";

export async function getPaymentMethods(
  supabase: SupabaseClient,
  brandId: string,
): Promise<PaymentMethodRow[]> {
  const { data, error } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("brand_id", brandId)
    .order("urutan", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PaymentMethodRow[];
}

export async function uploadBrandAsset({
  supabase,
  brandId,
  kind,
  file,
}: {
  supabase: SupabaseClient;
  brandId: string;
  kind: "logo" | "qris";
  file: File;
}): Promise<{ url: string } | { error: string }> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { error: "Format gambar harus PNG atau JPG." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { error: "Ukuran gambar maksimal 2 MB." };
  }

  const bucket = kind === "logo" ? "brand-logos" : "brand-qris";
  const path = `${brandId}/${kind}-${Date.now()}.${fileExtension(file)}`;
  const bytes = await file.arrayBuffer();

  const { error } = await supabase.storage.from(bucket).upload(path, bytes, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) {
    return { error: "Gagal mengupload gambar. Coba lagi." };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  if (!data?.publicUrl) {
    return { error: "Gambar terupload, tetapi URL publik tidak tersedia." };
  }

  return { url: data.publicUrl };
}
