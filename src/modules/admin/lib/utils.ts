import { formatDate, formatDateTime, formatRupiah, toNumber } from "./format";
import type {
  AdminBrand,
  OrderRow,
  ServiceRow,
  VoucherRow,
} from "../types";

export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export function initials(value: string): string {
  return value
    .split(/[\s&-]+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

export function normalizeWa(value: string | null | undefined): string | null {
  const digits = (value ?? "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

export function buildWaUrl(
  number: string | null | undefined,
  message: string,
): string | null {
  const wa = normalizeWa(number);
  if (!wa) return null;
  return `https://wa.me/${wa}?text=${encodeURIComponent(message)}`;
}

export function sanitizeSearch(value: string): string {
  return value
    .replace(/[%_,()*"'\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function parseNumericInput(value: FormDataEntryValue | null): number {
  return Number(onlyDigits(String(value ?? ""))) || 0;
}

export function isCancellableStatus(status: OrderRow["status"]): boolean {
  return ["menunggu_cek", "menunggu_bayar", "sudah_bayar"].includes(status);
}

export function orderWa(order: OrderRow): string | null {
  if (order.wa_pembeli) return normalizeWa(order.wa_pembeli);
  const inputWa = order.input_pembeli?.wa_pembeli;
  if (typeof inputWa === "string" && inputWa.trim()) return normalizeWa(inputWa);
  const nomor = order.nomor_tujuan.replace(/\D/g, "");
  if (nomor.length >= 9 && (nomor.startsWith("08") || nomor.startsWith("62"))) {
    return normalizeWa(nomor);
  }
  return null;
}

export function buyerFields(order: OrderRow, service: ServiceRow | null) {
  const fields = service?.input_fields ?? [];
  if (!fields.length) {
    return [{ label: "Nomor tujuan", value: order.nomor_tujuan }];
  }
  return fields.map((field) => ({
    label: field.label,
    value:
      order.input_pembeli && order.input_pembeli[field.key] !== undefined
        ? order.input_pembeli[field.key]
        : "-",
  }));
}

export function paymentMessage(input: {
  brand: AdminBrand;
  order: OrderRow;
  total: number | string;
  expiresAt: string | null;
}) {
  const { brand, order, total, expiresAt } = input;
  const lines = [
    `Halo, tagihan ${order.nama_layanan} untuk ${order.nomor_tujuan} sudah siap.`,
    `Kode referensi: ${order.ref}`,
    `Layanan: ${order.nama_layanan}${order.nama_produk ? ` - ${order.nama_produk}` : ""}`,
    `Nomor pelanggan: ${order.nomor_tujuan}`,
    `Total: ${formatRupiah(total)}`,
    expiresAt ? `Batas bayar: ${formatDateTime(expiresAt)} WIB` : null,
    `Link pembayaran: https://${brand.domain}/bayar?ref=${order.ref}`,
  ].filter(Boolean);
  return lines.join("\n");
}

export function snResendMessage(input: {
  brand: AdminBrand;
  order: OrderRow;
}) {
  const { brand, order } = input;
  return [
    `Halo, transaksi ${order.ref} sudah sukses.`,
    `Layanan: ${order.nama_layanan}${order.nama_produk ? ` - ${order.nama_produk}` : ""}`,
    `Nomor: ${order.nomor_tujuan}`,
    order.sn ? `SN / Token: ${order.sn}` : null,
    `Terima kasih sudah bertransaksi di ${brand.nama}.`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function chatMessage(input: { brand: AdminBrand; order: OrderRow }) {
  return [
    `Halo, kami dari ${input.brand.nama}.`,
    `Kami ingin konfirmasi transaksi dengan kode ${input.order.ref} (${input.order.nama_layanan}).`,
    `Status saat ini: ${input.order.status.replace(/_/g, " ")}.`,
    `Tanggal: ${formatDate(input.order.created_at)}.`,
  ].join("\n");
}

export function computeVoucherDiscount(
  voucher: VoucherRow | null,
  subtotal: number,
  serviceId?: string,
): number {
  if (!voucher || !voucher.aktif || subtotal <= 0) return 0;
  if (voucher.berlaku_sampai) {
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    if (voucher.berlaku_sampai < today) return 0;
  }
  if (serviceId && voucher.service_ids.length > 0) {
    if (!voucher.service_ids.includes(serviceId)) return 0;
  }
  if (subtotal < toNumber(voucher.min_transaksi)) return 0;

  const raw =
    voucher.jenis === "persen"
      ? Math.floor((subtotal * toNumber(voucher.nilai)) / 100)
      : toNumber(voucher.nilai);
  const maximum = voucher.maks_potongan
    ? toNumber(voucher.maks_potongan)
    : Number.MAX_SAFE_INTEGER;

  return Math.max(0, Math.min(raw, maximum, subtotal));
}

export function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function valueOrDash(value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

export function productProfit(price: number | string, cost: number | string) {
  return toNumber(price) - toNumber(cost);
}

export function escapeCsv(value: unknown): string {
  const string = value === null || value === undefined ? "" : String(value);
  return `"${string.replace(/"/g, '""')}"`;
}

export function fileExtension(file: File): string {
  if (file.type === "image/png") return "png";
  if (file.type === "image/jpeg") return "jpg";
  const fromName = file.name.split(".").pop()?.toLowerCase();
  return fromName && /^[a-z0-9]{2,5}$/.test(fromName) ? fromName : "bin";
}
