import type {
  OrderStatus,
  PaymentMethodRow,
  ServiceRow,
  TransactionFilterKey,
  VoucherRow,
} from "./types";

export const PAGE_SIZE = 10;

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg"];

export const REMEMBER_COOKIE = "admin_remember";


export const DEADLINE_OPTIONS = [
  { value: 15, label: "15 menit" },
  { value: 30, label: "30 menit" },
  { value: 60, label: "1 jam" },
  { value: 120, label: "2 jam" },
];

export const MAX_PENDING_OPTIONS = [1, 2, 3, 5, 10];

export const STATUS_META: Record<
  OrderStatus,
  { label: string; pill: string; hint: string }
> = {
  menunggu_cek: {
    label: "Cek tagihan",
    pill: "adm-pill adm-pill-warn",
    hint: "Nominal tagihan belum ditetapkan",
  },
  menunggu_bayar: {
    label: "Menunggu bayar",
    pill: "adm-pill adm-pill-wait",
    hint: "Menunggu pembayaran pembeli",
  },
  sudah_bayar: {
    label: "Sudah bayar",
    pill: "adm-pill adm-pill-paid",
    hint: "Bukti bayar sudah masuk, perlu diproses",
  },
  sukses: {
    label: "Sukses",
    pill: "adm-pill adm-pill-done",
    hint: "Transaksi selesai",
  },
  dibatalkan: {
    label: "Dibatalkan",
    pill: "adm-pill adm-pill-cancel",
    hint: "Transaksi dibatalkan",
  },
};

export const TRANSACTION_FILTERS: {
  key: TransactionFilterKey;
  label: string;
  status: OrderStatus | null;
}[] = [
  { key: "all", label: "Semua", status: null },
  { key: "cek", label: "Cek tagihan", status: "menunggu_cek" },
  { key: "menunggu", label: "Menunggu bayar", status: "menunggu_bayar" },
  { key: "sudah", label: "Sudah bayar", status: "sudah_bayar" },
  { key: "sukses", label: "Sukses", status: "sukses" },
  { key: "batal", label: "Dibatalkan", status: "dibatalkan" },
];

export const FILTER_STATUS: Record<TransactionFilterKey, OrderStatus | null> = {
  all: null,
  cek: "menunggu_cek",
  menunggu: "menunggu_bayar",
  sudah: "sudah_bayar",
  sukses: "sukses",
  batal: "dibatalkan",
};

export function isTransactionFilterKey(
  value: string | undefined,
): value is TransactionFilterKey {
  return TRANSACTION_FILTERS.some((item) => item.key === value);
}

export function statusLabel(status: OrderStatus) {
  return STATUS_META[status].label;
}

export function paymentLogoLabel(method: string) {
  const known: Record<string, string> = {
    QRIS: "QRIS",
    DANA: "DANA",
    OVO: "OVO",
    GoPay: "GOPAY",
    ShopeePay: "SPAY",
    "Virtual Account": "VA",
  };
  if (known[method]) return known[method];
  return method
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 4)
    .toUpperCase();
}

export function paymentMethodCaption(method: PaymentMethodRow) {
  const fee = Number(method.biaya_admin) || 0;
  return fee > 0 ? `Biaya admin Rp${fee.toLocaleString("id-ID")}` : "Gratis admin";
}

export function voucherRule(voucher: VoucherRow, services: ServiceRow[]) {
  const value = Number(voucher.nilai) || 0;
  const max = voucher.maks_potongan ? Number(voucher.maks_potongan) : 0;
  const min = Number(voucher.min_transaksi) || 0;

  const discount =
    voucher.jenis === "persen"
      ? `Cashback ${value.toLocaleString("id-ID")}%`
      : `Potongan Rp${value.toLocaleString("id-ID")}`;

  const parts = [discount];
  if (voucher.jenis === "persen" && max > 0) {
    parts.push(`maks. Rp${max.toLocaleString("id-ID")}`);
  }
  if (min > 0) {
    parts.push(`min. Rp${min.toLocaleString("id-ID")}`);
  }

  const scope =
    voucher.service_ids.length === 0
      ? "Semua layanan"
      : `Khusus ${voucher.service_ids
          .map((id) => services.find((service) => service.id === id)?.nama)
          .filter(Boolean)
          .join(", ")}`;

  return `${parts.join(" · ")} · ${scope}`;
}
