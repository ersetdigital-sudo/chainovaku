"use server";

import { revalidatePath } from "next/cache";
import { toNumber } from "../../lib/format";
import type { ActionResult, OrderStatus } from "../../types";
import { requireAdmin } from "../auth";

type SetBillResult = {
  ref: string;
  total: number;
  expires_at: string;
};

const ALLOWED_STATUS_TARGETS: OrderStatus[] = [
  "sudah_bayar",
  "sukses",
  "dibatalkan",
];

function errorMessage(error: { message?: string } | null): string {
  const message = error?.message ?? "";
  if (
    /wajib|tidak|ditolak|ditemukan|diizinkan|nominal|denda|voucher|akses|status/i.test(
      message,
    )
  ) {
    return message;
  }
  return "Gagal menyimpan perubahan. Coba lagi.";
}

function refreshAdminPaths() {
  revalidatePath("/admin", "layout");
  revalidatePath("/admin");
  revalidatePath("/admin/transaksi");
}

export async function setBillAmountAction(
  orderId: string,
  nominal: number,
  denda: number,
): Promise<ActionResult<SetBillResult>> {
  const nominalValue = toNumber(nominal);
  const dendaValue = toNumber(denda);

  if (!orderId) {
    return { ok: false, message: "Transaksi tidak ditemukan." };
  }
  if (nominalValue <= 0) {
    return { ok: false, message: "Nominal tagihan harus lebih dari 0." };
  }
  if (dendaValue < 0) {
    return { ok: false, message: "Denda tidak boleh negatif." };
  }

  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.rpc("set_bill_amount", {
    p_order_id: orderId,
    p_nominal_tagihan: nominalValue,
    p_denda: dendaValue,
  });

  if (error) {
    return { ok: false, message: errorMessage(error) };
  }

  refreshAdminPaths();
  const result = data as { ref: string; total: number | string; expires_at: string };
  return {
    ok: true,
    message: "Nominal tagihan disimpan. Link bayar siap dikirim.",
    data: {
      ref: result.ref,
      total: toNumber(result.total),
      expires_at: result.expires_at,
    },
  };
}

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus,
  sn?: string,
  reason?: string,
): Promise<ActionResult> {
  if (!orderId) {
    return { ok: false, message: "Transaksi tidak ditemukan." };
  }
  if (!ALLOWED_STATUS_TARGETS.includes(status)) {
    return { ok: false, message: "Status tujuan tidak diizinkan." };
  }

  const snValue = sn?.trim() ?? "";
  const reasonValue = reason?.trim() ?? "";

  if (status === "sukses" && !snValue) {
    return { ok: false, message: "SN / token wajib diisi." };
  }
  if (status === "dibatalkan" && !reasonValue) {
    return { ok: false, message: "Alasan pembatalan wajib diisi." };
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase.rpc("update_order_status", {
    p_order_id: orderId,
    p_status: status,
    p_sn: status === "sukses" ? snValue : null,
    p_catatan: status === "dibatalkan" ? reasonValue : null,
  });

  if (error) {
    return { ok: false, message: errorMessage(error) };
  }

  refreshAdminPaths();
  const messages: Record<OrderStatus, string> = {
    menunggu_cek: "Status diperbarui.",
    menunggu_bayar: "Status diperbarui.",
    sudah_bayar: "Transaksi ditandai sudah bayar.",
    sukses: "SN disimpan dan transaksi ditandai sukses.",
    dibatalkan: "Transaksi dibatalkan.",
  };
  return { ok: true, message: messages[status] };
}
