import type { SupabaseClient } from "@supabase/supabase-js";
import { toNumber } from "../lib/format";
import type { ServiceRow, VoucherRow } from "../types";

export async function getVoucherData(
  supabase: SupabaseClient,
  brandId: string,
): Promise<{ services: ServiceRow[]; vouchers: VoucherRow[] }> {
  const [servicesResult, vouchersResult, usageResult] = await Promise.all([
    supabase
      .from("services")
      .select("*")
      .eq("brand_id", brandId)
      .order("urutan", { ascending: true })
      .order("nama", { ascending: true }),
    supabase
      .from("vouchers")
      .select("*")
      .eq("brand_id", brandId)
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("voucher_kode,potongan")
      .eq("brand_id", brandId)
      .eq("status", "sukses")
      .not("voucher_kode", "is", null),
  ]);

  if (servicesResult.error) throw servicesResult.error;
  if (vouchersResult.error) throw vouchersResult.error;
  if (usageResult.error) throw usageResult.error;

  const usage = new Map<string, { count: number; total: number }>();
  ((usageResult.data ?? []) as { voucher_kode: string | null; potongan: number | string }[]).forEach(
    (order) => {
      const code = order.voucher_kode?.toUpperCase();
      if (!code) return;
      const current = usage.get(code) ?? { count: 0, total: 0 };
      usage.set(code, {
        count: current.count + 1,
        total: current.total + toNumber(order.potongan),
      });
    },
  );

  const vouchers = ((vouchersResult.data ?? []) as VoucherRow[]).map((voucher) => ({
    ...voucher,
    usage: usage.get(voucher.kode.toUpperCase()) ?? { count: 0, total: 0 },
  }));

  return {
    services: (servicesResult.data ?? []) as ServiceRow[],
    vouchers,
  };
}
