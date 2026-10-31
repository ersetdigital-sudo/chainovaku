export type OrderStatus =
  | "menunggu_cek"
  | "menunggu_bayar"
  | "sudah_bayar"
  | "sukses"
  | "dibatalkan";

export type WebBrand = {
  id: string;
  nama: string;
  slug: string;
  domain: string;
  tagline: string | null;
  logo_url: string | null;
  warna_utama: string | null;
  wa_cs: string | null;
  qris_image_url: string | null;
  batas_bayar_menit: number;
  jam_cek_tagihan: string | null;
};

export type DbResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

export type PaymentInfo = {
  ref: string;
  status: OrderStatus;
  total: number | null;
  nama_layanan: string;
  nama_produk: string | null;
  nomor_tujuan: string;
  metode_bayar: string | null;
  tipe_metode: "qr" | "ewallet" | "va" | null;
  biaya_admin: number;
  potongan: number;
  voucher_kode: string | null;
  qris_image_url: string | null;
  logo_url: string | null;
  nama_brand: string;
  wa_cs: string | null;
  expires_at: string | null;
  jam_cek_tagihan: string | null;
  nominal_tagihan: number | null;
  denda: number;
  created_at: string | null;
};

export type OrderLookup = {
  ref: string;
  layanan: string;
  produk: string | null;
  nomor_tujuan: string;
  total: number | null;
  status: OrderStatus;
  sn: string | null;
  created_at: string;
  expires_at: string | null;
  paid_at: string | null;
  completed_at: string | null;
};

export type VoucherCheck = {
  valid: boolean;
  potongan: number;
  pesan: string;
};

export type CreateOrderResult = {
  ref: string;
  total: number;
  expires_at: string;
};

export type CreateBillResult = {
  ref: string;
  jam_cek_tagihan: string | null;
};

export type CreateOrderInput = {
  brandSlug: string;
  serviceId: string;
  productId: string;
  nomorTujuan: string;
  input: Record<string, string>;
  paymentMethodId: string;
  voucherCode?: string | null;
};

export type CreateBillCheckInput = {
  brandSlug: string;
  serviceId: string;
  nomorTujuan: string;
  input: Record<string, string>;
  waPembeli: string;
  paymentMethodId: string;
  voucherCode?: string | null;
};

export type CheckOrderInput = {
  brandSlug: string;
  ref?: string | null;
  nomorTujuan?: string | null;
};

export type CheckVoucherInput = {
  brandSlug: string;
  code: string;
  serviceId?: string | null;
  subtotal?: number;
};
