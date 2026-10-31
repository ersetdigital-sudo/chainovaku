"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult, VoucherDraft } from "../../types";
import { requireAdmin } from "../auth";

const CODE_RE = /^[A-Z0-9]{3,24}$/;

function refreshVouchers() {
  revalidatePath("/admin", "layout");
  revalidatePath("/admin");
  revalidatePath("/admin/voucher");
}

function dbError(error: { message?: string; code?: string } | null): string {
  if (error?.code === "23505") {
    return "Kode voucher sudah dipakai di brand ini.";
  }
  const message = error?.message ?? "";
  if (/voucher|kode|layanan|tidak|wajib|ditolak/i.test(message)) {
    return message;
  }
  return "Gagal menyimpan voucher. Coba lagi.";
}

export async function saveVoucherAction(
  draft: VoucherDraft,
): Promise<ActionResult<{ id: string }>> {
  const kode = draft.kode.trim().toUpperCase();
  if (!CODE_RE.test(kode)) {
    return {
      ok: false,
      message: "Kode voucher 3–24 karakter, hanya huruf dan angka.",
    };
  }
  if (!["persen", "tetap"].includes(draft.jenis)) {
    return { ok: false, message: "Jenis voucher tidak valid." };
  }
  if (!Number.isFinite(draft.nilai) || draft.nilai <= 0) {
    return { ok: false, message: "Nilai voucher harus lebih dari 0." };
  }
  if (draft.jenis === "persen" && draft.nilai > 100) {
    return { ok: false, message: "Persen voucher maksimal 100%." };
  }
  if (
    draft.maks_potongan !== null &&
    (!Number.isFinite(draft.maks_potongan) || draft.maks_potongan < 0)
  ) {
    return { ok: false, message: "Maks. potongan tidak valid." };
  }
  if (!Number.isFinite(draft.min_transaksi) || draft.min_transaksi < 0) {
    return { ok: false, message: "Min. transaksi tidak valid." };
  }
  if (
    draft.berlaku_sampai &&
    !/^\d{4}-\d{2}-\d{2}$/.test(draft.berlaku_sampai)
  ) {
    return { ok: false, message: "Tanggal berlaku tidak valid." };
  }

  const { brand, supabase } = await requireAdmin();

  let serviceIds = [...new Set(draft.service_ids)].filter(Boolean);
  if (serviceIds.length > 0) {
    const { data: ownedServices, error: serviceError } = await supabase
      .from("services")
      .select("id")
      .eq("brand_id", brand.id)
      .in("id", serviceIds);
    if (serviceError) return { ok: false, message: dbError(serviceError) };
    const owned = new Set(
      ((ownedServices ?? []) as { id: string }[]).map((service) => service.id),
    );
    serviceIds = serviceIds.filter((id) => owned.has(id));
    if (serviceIds.length !== new Set(draft.service_ids).size) {
      return { ok: false, message: "Ada layanan yang bukan milik brand ini." };
    }
  }

  const payload = {
    brand_id: brand.id,
    kode,
    jenis: draft.jenis,
    nilai: Math.round(draft.nilai),
    maks_potongan:
      draft.jenis === "persen" && draft.maks_potongan !== null
        ? Math.round(draft.maks_potongan)
        : null,
    min_transaksi:
      draft.jenis === "tetap" ? Math.round(draft.min_transaksi) : 0,
    service_ids: serviceIds,
    berlaku_sampai: draft.berlaku_sampai || null,
    aktif: draft.aktif,
  };

  if (draft.id) {
    const { data, error } = await supabase
      .from("vouchers")
      .update(payload)
      .eq("id", draft.id)
      .eq("brand_id", brand.id)
      .select("id")
      .maybeSingle();
    if (error) return { ok: false, message: dbError(error) };
    if (!data) return { ok: false, message: "Voucher tidak ditemukan." };
    refreshVouchers();
    return {
      ok: true,
      message: "Voucher berhasil diperbarui.",
      data: { id: data.id as string },
    };
  }

  const { data, error } = await supabase
    .from("vouchers")
    .insert(payload)
    .select("id")
    .single();
  if (error || !data) return { ok: false, message: dbError(error) };

  refreshVouchers();
  return {
    ok: true,
    message: "Voucher berhasil dibuat.",
    data: { id: data.id as string },
  };
}

export async function toggleVoucherAction(
  voucherId: string,
  aktif: boolean,
): Promise<ActionResult> {
  if (!voucherId) return { ok: false, message: "Voucher tidak ditemukan." };
  const { brand, supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("vouchers")
    .update({ aktif })
    .eq("id", voucherId)
    .eq("brand_id", brand.id)
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, message: dbError(error) };
  if (!data) return { ok: false, message: "Voucher tidak ditemukan." };

  refreshVouchers();
  return {
    ok: true,
    message: aktif ? "Voucher diaktifkan." : "Voucher dinonaktifkan.",
  };
}
