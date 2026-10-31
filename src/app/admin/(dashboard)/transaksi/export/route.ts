import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  FILTER_STATUS,
  isTransactionFilterKey,
  statusLabel,
} from "@/modules/admin/constants";
import { requireAdmin } from "@/modules/admin/data/auth";
import { getOrdersForExport } from "@/modules/admin/data/transactions";
import {
  formatDateTime,
  formatWaDisplay,
  toNumber,
} from "@/modules/admin/lib/format";

export const dynamic = "force-dynamic";

function csvCell(value: unknown): string {
  const string = value === null || value === undefined ? "" : String(value);
  const guarded = /^[=+\-@]/.test(string) ? `'${string}` : string;
  return `"${guarded.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const filterKey = isTransactionFilterKey(params.get("status") ?? undefined)
    ? (params.get("status") as keyof typeof FILTER_STATUS)
    : "all";
  const q = params.get("q")?.slice(0, 60) ?? "";
  const status = FILTER_STATUS[filterKey];

  const { brand, supabase } = await requireAdmin();

  try {
    const orders = await getOrdersForExport(supabase, brand.id, { status, q });

    const headers = [
      "Referensi",
      "Dibuat",
      "Layanan",
      "Produk",
      "Nomor tujuan",
      "WA pembeli",
      "Metode",
      "Voucher",
      "Potongan",
      "Biaya admin",
      "Total",
      "Status",
      "SN / Token",
      "Dibayar",
      "Selesai",
      "Dibatalkan",
      "Alasan batal",
    ];

    const rows = orders.map((order) => [
      order.ref,
      formatDateTime(order.created_at),
      order.nama_layanan,
      order.nama_produk ?? "",
      order.nomor_tujuan,
      formatWaDisplay(order.wa_pembeli),
      order.metode_bayar ?? "",
      order.voucher_kode ?? "",
      toNumber(order.potongan),
      toNumber(order.biaya_admin),
      order.total === null ? "" : toNumber(order.total),
      statusLabel(order.status),
      order.sn ?? "",
      order.paid_at ? formatDateTime(order.paid_at) : "",
      order.completed_at ? formatDateTime(order.completed_at) : "",
      order.cancelled_at ? formatDateTime(order.cancelled_at) : "",
      order.cancel_reason ?? "",
    ]);

    const csv = `\uFEFF${[headers, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n")}`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="transaksi-${brand.slug}-${new Date()
          .toISOString()
          .slice(0, 10)}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Gagal membuat file export." },
      { status: 500 },
    );
  }
}
