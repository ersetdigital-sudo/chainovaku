import type { SupabaseClient } from "@supabase/supabase-js";
import type { DashboardSummary, OrderRow } from "../types";
import { monthDatabaseValue } from "../lib/format";

export async function getDashboardSummary(
  supabase: SupabaseClient,
  brandId: string,
  monthKey: string,
): Promise<DashboardSummary> {
  const { data, error } = await supabase.rpc("dashboard_summary", {
    p_brand_id: brandId,
    p_bulan: monthDatabaseValue(monthKey),
  });
  if (error) throw error;
  const summary = data as DashboardSummary;
  return {
    ...summary,
    omzet: Number(summary?.omzet ?? 0),
    total_modal: Number(summary?.total_modal ?? 0),
    total_potongan_voucher: Number(summary?.total_potongan_voucher ?? 0),
    net_profit: Number(summary?.net_profit ?? 0),
    jumlah_transaksi: Number(summary?.jumlah_transaksi ?? 0),
    rata_rata: Number(summary?.rata_rata ?? 0),
    persentase_batal: Number(summary?.persentase_batal ?? 0),
    menunggu_cek: Number(summary?.menunggu_cek ?? 0),
    sudah_bayar: Number(summary?.sudah_bayar ?? 0),
    layanan_terlaris: (summary?.layanan_terlaris ?? []).map((item) => ({
      ...item,
      jumlah: Number(item.jumlah ?? 0),
      omzet: Number(item.omzet ?? 0),
    })),
  };
}

export async function getRecentOrders(
  supabase: SupabaseClient,
  brandId: string,
  limit = 6,
): Promise<OrderRow[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id,brand_id,ref,service_id,product_id,nama_layanan,nama_produk,harga_modal,harga_jual,input_pembeli,nomor_tujuan,wa_pembeli,nominal_tagihan,denda,payment_method_id,metode_bayar,biaya_admin,voucher_kode,potongan,total,status,sn,expires_at,checked_at,paid_at,completed_at,cancelled_at,cancel_reason,created_at,updated_at",
    )
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as OrderRow[];
}

export async function getActionableCount(
  supabase: SupabaseClient,
  brandId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("brand_id", brandId)
    .in("status", ["menunggu_cek", "sudah_bayar"]);
  if (error) throw error;
  return count ?? 0;
}
