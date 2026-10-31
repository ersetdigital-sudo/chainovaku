"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult, SettingsDraft } from "../../types";
import { requireAdmin } from "../auth";
import { getPaymentMethods } from "../settings";

function dbError(error: { message?: string } | null): string {
  const message = error?.message ?? "";
  if (/tidak|wajib|ditolak|brand/i.test(message)) return message;
  return "Gagal menyimpan perubahan. Coba lagi.";
}

export async function saveSettingsAction(
  draft: SettingsDraft,
): Promise<ActionResult> {
  const nama = draft.nama.trim();
  if (!nama) return { ok: false, message: "Nama brand wajib diisi." };
  if (!/^#[0-9a-fA-F]{6}$/.test(draft.warna_utama)) {
    return { ok: false, message: "Warna utama tidak valid." };
  }
  if (
    !Number.isFinite(draft.batas_bayar_menit) ||
    draft.batas_bayar_menit < 5 ||
    draft.batas_bayar_menit > 1440
  ) {
    return { ok: false, message: "Batas waktu bayar tidak valid." };
  }
  if (
    !Number.isFinite(draft.maks_order_pending) ||
    draft.maks_order_pending < 1 ||
    draft.maks_order_pending > 50
  ) {
    return { ok: false, message: "Batas transaksi belum bayar tidak valid." };
  }

  const wa = draft.wa_cs.replace(/\D/g, "");
  if (wa && (wa.length < 8 || wa.length > 15)) {
    return { ok: false, message: "Nomor WhatsApp CS tidak valid." };
  }

  const logoUrl = draft.logo_url?.trim() || null;
  const qrisUrl = draft.qris_image_url?.trim() || null;
  if (logoUrl && !/^https?:\/\//i.test(logoUrl)) {
    return { ok: false, message: "URL logo tidak valid." };
  }
  if (qrisUrl && !/^https?:\/\//i.test(qrisUrl)) {
    return { ok: false, message: "URL QRIS tidak valid." };
  }

  const { brand, supabase } = await requireAdmin();

  const { error: brandError } = await supabase
    .from("brands")
    .update({
      nama,
      tagline: draft.tagline.trim() || null,
      warna_utama: draft.warna_utama.toUpperCase(),
      wa_cs: wa || null,
      batas_bayar_menit: Math.round(draft.batas_bayar_menit),
      maks_order_pending: Math.round(draft.maks_order_pending),
      logo_url: logoUrl,
      qris_image_url: qrisUrl,
    })
    .eq("id", brand.id);
  if (brandError) return { ok: false, message: dbError(brandError) };

  const currentMethods = await getPaymentMethods(supabase, brand.id);
  const draftById = new Map(
    draft.paymentMethods.map((method) => [method.id, method]),
  );

  const rows = currentMethods.map((method) => {
    const change = draftById.get(method.id);
    const fee = change?.biaya_admin ?? Number(method.biaya_admin);
    return {
      id: method.id,
      brand_id: method.brand_id,
      nama: method.nama,
      tipe: method.tipe,
      biaya_admin:
        Number.isFinite(fee) && fee >= 0 ? Math.round(fee) : 0,
      urutan: method.urutan,
      aktif: change?.aktif ?? method.aktif,
    };
  });

  if (rows.length > 0) {
    const { error: methodError } = await supabase
      .from("payment_methods")
      .upsert(rows, { onConflict: "id" });
    if (methodError) return { ok: false, message: dbError(methodError) };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
  revalidatePath("/admin");
  revalidatePath("/admin/pengaturan");

  return { ok: true, message: "Perubahan brand dan pembayaran disimpan." };
}
