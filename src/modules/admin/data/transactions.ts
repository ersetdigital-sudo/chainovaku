import type { SupabaseClient } from "@supabase/supabase-js";
import { PAGE_SIZE } from "../constants";
import { sanitizeSearch } from "../lib/utils";
import type {
  OrderLogRow,
  OrderRow,
  OrderStatus,
  SelectedTransaction,
  ServiceRow,
  VoucherRow,
} from "../types";

const ORDER_COLUMNS =
  "id,brand_id,ref,service_id,product_id,nama_layanan,nama_produk,harga_modal,harga_jual,input_pembeli,nomor_tujuan,wa_pembeli,nominal_tagihan,denda,payment_method_id,metode_bayar,biaya_admin,voucher_kode,potongan,total,status,sn,expires_at,checked_at,paid_at,completed_at,cancelled_at,cancel_reason,created_at,updated_at";

export type TransactionCounts = Record<OrderStatus, number> & { all: number };

const COUNT_STATUSES: OrderStatus[] = [
  "menunggu_cek",
  "menunggu_bayar",
  "sudah_bayar",
  "sukses",
  "dibatalkan",
];

export async function getTransactionCounts(
  supabase: SupabaseClient,
  brandId: string,
): Promise<TransactionCounts> {
  const results = await Promise.all(
    COUNT_STATUSES.map((status) =>
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("brand_id", brandId)
        .eq("status", status),
    ),
  );

  const counts = {
    all: 0,
    menunggu_cek: 0,
    menunggu_bayar: 0,
    sudah_bayar: 0,
    sukses: 0,
    dibatalkan: 0,
  } as TransactionCounts;

  results.forEach((result, index) => {
    if (result.error) throw result.error;
    const status = COUNT_STATUSES[index];
    counts[status] = result.count ?? 0;
    counts.all += result.count ?? 0;
  });

  return counts;
}

export async function getTransactionList(
  supabase: SupabaseClient,
  brandId: string,
  options: { status: OrderStatus | null; q: string; page: number },
): Promise<{
  orders: OrderRow[];
  total: number;
  page: number;
  pageCount: number;
}> {
  const search = sanitizeSearch(options.q);

  let countQuery = supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("brand_id", brandId);
  if (options.status) countQuery = countQuery.eq("status", options.status);
  if (search) {
    countQuery = countQuery.or(
      `ref.ilike.%${search}%,nomor_tujuan.ilike.%${search}%`,
    );
  }
  const countResult = await countQuery;
  if (countResult.error) throw countResult.error;

  const total = countResult.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, options.page), pageCount);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("orders")
    .select(ORDER_COLUMNS, { count: "exact" })
    .eq("brand_id", brandId);
  if (options.status) query = query.eq("status", options.status);
  if (search) {
    query = query.or(
      `ref.ilike.%${search}%,nomor_tujuan.ilike.%${search}%`,
    );
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) throw error;

  return {
    orders: (data ?? []) as OrderRow[],
    total,
    page,
    pageCount,
  };
}

export async function getTransactionDetail(
  supabase: SupabaseClient,
  brandId: string,
  orderId: string,
): Promise<SelectedTransaction | null> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("id", orderId)
    .eq("brand_id", brandId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const order = data as OrderRow;

  const [serviceResult, logsResult, voucherResult] = await Promise.all([
    supabase.from("services").select("*").eq("id", order.service_id).maybeSingle(),
    supabase
      .from("order_logs")
      .select("*")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true }),
    order.voucher_kode
      ? supabase
          .from("vouchers")
          .select("*")
          .eq("brand_id", brandId)
          .eq("kode", order.voucher_kode)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);
  if (serviceResult.error) throw serviceResult.error;
  if (logsResult.error) throw logsResult.error;
  if (voucherResult.error) throw voucherResult.error;

  const logs = (logsResult.data ?? []) as OrderLogRow[];
  const adminIds = [
    ...new Set(logs.map((log) => log.admin_id).filter(Boolean) as string[]),
  ];
  if (adminIds.length > 0) {
    const { data: admins, error: adminError } = await supabase
      .from("admins")
      .select("id,nama")
      .in("id", adminIds);
    if (!adminError && admins) {
      const names = new Map(
        (admins as { id: string; nama: string }[]).map((admin) => [
          admin.id,
          admin.nama,
        ]),
      );
      logs.forEach((log) => {
        log.admin_nama = log.admin_id ? names.get(log.admin_id) ?? null : null;
      });
    }
  }

  return {
    order,
    service: (serviceResult.data as ServiceRow | null) ?? null,
    voucher: (voucherResult.data as VoucherRow | null) ?? null,
    logs,
  };
}

export async function getOrdersForExport(
  supabase: SupabaseClient,
  brandId: string,
  options: { status: OrderStatus | null; q: string },
): Promise<OrderRow[]> {
  const search = sanitizeSearch(options.q);
  let query = supabase
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("brand_id", brandId);
  if (options.status) query = query.eq("status", options.status);
  if (search) {
    query = query.or(
      `ref.ilike.%${search}%,nomor_tujuan.ilike.%${search}%`,
    );
  }
  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error) throw error;
  return (data ?? []) as OrderRow[];
}
