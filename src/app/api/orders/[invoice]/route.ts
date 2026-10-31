import { getOrderByRef, getPaymentByRef } from "@/lib/db/server";

type PublicStatus = "success" | "processing" | "pending" | "expired";

function mapStatus(status: string): PublicStatus {
  if (status === "sukses") return "success";
  if (status === "sudah_bayar") return "processing";
  if (status === "dibatalkan") return "expired";
  return "pending";
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ invoice: string }> },
) {
  const { invoice } = await context.params;
  const [payment, orders] = await Promise.all([
    getPaymentByRef(invoice),
    getOrderByRef(invoice),
  ]);

  if (!payment.data) {
    return Response.json(
      { message: payment.error || "Pesanan tidak ditemukan" },
      { status: 404 },
    );
  }

  const data = payment.data;
  const detail = orders.data?.[0] ?? null;
  const created = data.created_at ? new Date(data.created_at).getTime() : Date.now();

  return Response.json({
    inv: data.ref,
    status: mapStatus(data.status),
    service: data.nama_layanan,
    product: data.nama_produk ?? "-",
    lines: [
      ["Layanan", data.nama_layanan],
      ["Produk", data.nama_produk ?? "-"],
      ["Nomor tujuan", data.nomor_tujuan],
    ],
    method: data.metode_bayar ?? "QRIS",
    total: data.total ?? 0,
    contact: "",
    sn: detail?.sn ?? "",
    label: "SN / Token",
    created,
    updated: detail?.completed_at
      ? new Date(detail.completed_at).getTime()
      : created,
    ...(detail?.paid_at
      ? { paidAt: new Date(detail.paid_at).getTime() }
      : {}),
  });
}
