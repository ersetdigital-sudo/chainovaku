import { isOrderStatus } from "./status";
import type {
  CreateBillResult,
  CreateOrderResult,
  OrderLookup,
  PaymentInfo,
  VoucherCheck,
} from "./types";

function num(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function nullableNum(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function nullableText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function status(value: unknown) {
  return isOrderStatus(value) ? value : "menunggu_bayar";
}

function methodType(value: unknown): PaymentInfo["tipe_metode"] {
  return value === "qr" || value === "ewallet" || value === "va" || value === "ew"
    ? (value === "ew" ? "ewallet" : value)
    : null;
}

export function mapPaymentInfo(raw: unknown): PaymentInfo {
  const row = (raw ?? {}) as Record<string, unknown>;
  return {
    ref: text(row.ref),
    status: status(row.status),
    total: nullableNum(row.total),
    nama_layanan: text(row.nama_layanan),
    nama_produk: nullableText(row.nama_produk),
    nomor_tujuan: text(row.nomor_tujuan),
    metode_bayar: nullableText(row.metode_bayar),
    tipe_metode: methodType(row.tipe_metode),
    biaya_admin: num(row.biaya_admin),
    potongan: num(row.potongan),
    voucher_kode: nullableText(row.voucher_kode),
    qris_image_url: nullableText(row.qris_image_url),
    logo_url: nullableText(row.logo_url),
    nama_brand: text(row.nama_brand),
    wa_cs: nullableText(row.wa_cs),
    expires_at: nullableText(row.expires_at),
    jam_cek_tagihan: nullableText(row.jam_cek_tagihan),
    nominal_tagihan: nullableNum(row.nominal_tagihan),
    denda: num(row.denda),
    created_at: nullableText(row.created_at),
  };
}

export function mapOrderLookup(raw: unknown): OrderLookup {
  const row = (raw ?? {}) as Record<string, unknown>;
  return {
    ref: text(row.ref),
    layanan: text(row.layanan),
    produk: nullableText(row.produk),
    nomor_tujuan: text(row.nomor_tujuan),
    total: nullableNum(row.total),
    status: status(row.status),
    sn: nullableText(row.sn),
    created_at: text(row.created_at),
    expires_at: nullableText(row.expires_at),
    paid_at: nullableText(row.paid_at),
    completed_at: nullableText(row.completed_at),
  };
}

export function mapOrderLookupList(raw: unknown): OrderLookup[] {
  return Array.isArray(raw) ? raw.map(mapOrderLookup) : [];
}

export function mapCreateOrder(raw: unknown): CreateOrderResult {
  const row = (raw ?? {}) as Record<string, unknown>;
  return {
    ref: text(row.ref),
    total: num(row.total),
    expires_at: text(row.expires_at),
  };
}

export function mapCreateBill(raw: unknown): CreateBillResult {
  const row = (raw ?? {}) as Record<string, unknown>;
  return {
    ref: text(row.ref),
    jam_cek_tagihan: nullableText(row.jam_cek_tagihan),
  };
}

export function mapVoucherCheck(raw: unknown): VoucherCheck {
  const row = (raw ?? {}) as Record<string, unknown>;
  return {
    valid: row.valid === true,
    potongan: num(row.potongan),
    pesan: text(row.pesan, "Kode voucher tidak valid."),
  };
}
