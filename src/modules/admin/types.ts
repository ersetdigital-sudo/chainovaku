export type AdminRole = "owner" | "admin" | "super_admin";

export type OrderStatus =
  | "menunggu_cek"
  | "menunggu_bayar"
  | "sudah_bayar"
  | "sukses"
  | "dibatalkan";

export type ServiceType = "nominal" | "tagihan";
export type PaymentType = "qr" | "ewallet" | "va";
export type VoucherType = "persen" | "tetap";

export type Numeric = number | string;

export type ServiceInputField = {
  key: string;
  label: string;
  placeholder?: string;
  wajib: boolean;
};

export type AdminBrand = {
  id: string;
  nama: string;
  slug: string;
  domain: string;
  tagline: string | null;
  logo_url: string | null;
  warna_utama: string | null;
  kode_ref: string;
  wa_cs: string | null;
  qris_image_url: string | null;
  batas_bayar_menit: number;
  maks_order_pending: number;
  jam_cek_tagihan: string | null;
  created_at?: string;
  updated_at?: string;
};

export type PublicBrand = Pick<
  AdminBrand,
  | "id"
  | "nama"
  | "slug"
  | "domain"
  | "tagline"
  | "logo_url"
  | "warna_utama"
  | "wa_cs"
  | "qris_image_url"
  | "batas_bayar_menit"
  | "jam_cek_tagihan"
>;

export type AdminRow = {
  id: string;
  user_id: string;
  brand_id: string | null;
  nama: string;
  role: AdminRole;
  aktif: boolean;
};

export type ServiceRow = {
  id: string;
  brand_id: string;
  nama: string;
  slug: string;
  jenis: ServiceType;
  input_fields: ServiceInputField[];
  biaya_admin: Numeric;
  biaya_supplier: Numeric;
  urutan: number;
  aktif: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ProductRow = {
  id: string;
  brand_id: string;
  service_id: string;
  nama: string;
  harga_modal: Numeric;
  harga_jual: Numeric;
  urutan: number;
  aktif: boolean;
  created_at?: string;
  updated_at?: string;
};

export type PaymentMethodRow = {
  id: string;
  brand_id: string;
  nama: string;
  tipe: PaymentType;
  biaya_admin: Numeric;
  urutan: number;
  aktif: boolean;
  created_at?: string;
  updated_at?: string;
};

export type VoucherUsage = {
  count: number;
  total: Numeric;
};

export type VoucherRow = {
  id: string;
  brand_id: string;
  kode: string;
  jenis: VoucherType;
  nilai: Numeric;
  maks_potongan: Numeric | null;
  min_transaksi: Numeric;
  service_ids: string[];
  berlaku_sampai: string | null;
  aktif: boolean;
  created_at?: string;
  updated_at?: string;
  usage?: VoucherUsage;
};

export type OrderRow = {
  id: string;
  brand_id: string;
  ref: string;
  service_id: string;
  product_id: string | null;
  nama_layanan: string;
  nama_produk: string | null;
  harga_modal: Numeric | null;
  harga_jual: Numeric | null;
  input_pembeli: Record<string, unknown>;
  nomor_tujuan: string;
  wa_pembeli: string | null;
  nominal_tagihan: Numeric | null;
  denda: Numeric;
  payment_method_id: string | null;
  metode_bayar: string | null;
  biaya_admin: Numeric;
  voucher_kode: string | null;
  potongan: Numeric;
  total: Numeric | null;
  status: OrderStatus;
  sn: string | null;
  expires_at: string | null;
  checked_at: string | null;
  paid_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  created_at: string;
  updated_at?: string;
};

export type OrderLogRow = {
  id: string;
  brand_id: string;
  order_id: string;
  status_dari: OrderStatus | null;
  status_ke: OrderStatus;
  catatan: string | null;
  admin_id: string | null;
  admin_nama?: string | null;
  created_at: string;
};

export type DashboardSummary = {
  brand_id: string | null;
  bulan: string;
  omzet: Numeric;
  total_modal: Numeric;
  total_potongan_voucher: Numeric;
  net_profit: Numeric;
  jumlah_transaksi: number;
  rata_rata: Numeric;
  persentase_batal: Numeric;
  layanan_terlaris: { nama: string; jumlah: number; omzet: Numeric }[];
  menunggu_cek: number;
  sudah_bayar: number;
};

export type TransactionFilterKey =
  | "all"
  | "cek"
  | "menunggu"
  | "sudah"
  | "sukses"
  | "batal";

export type ActionResult<T = undefined> =
  | { ok: true; message: string; data?: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

export type LoginState = {
  error?: string;
  success?: string;
};

export type AccessState = "ok" | "inactive" | "no_access";

export type SelectedTransaction = {
  order: OrderRow;
  service: ServiceRow | null;
  voucher: VoucherRow | null;
  logs: OrderLogRow[];
};

export type ServiceFieldDraft = {
  key?: string;
  label: string;
  placeholder: string;
  wajib: boolean;
};

export type ServiceDraft = {
  nama: string;
  jenis: ServiceType;
  urutan: number;
  aktif: boolean;
  inputFields: ServiceFieldDraft[];
};

export type ProductDraft = {
  id?: string;
  serviceId: string;
  nama: string;
  harga_modal: number;
  harga_jual: number;
  urutan: number;
  aktif: boolean;
};

export type BillSettingsDraft = {
  serviceId: string;
  biaya_admin: number;
  biaya_supplier: number;
  jam_cek_tagihan: string;
};

export type VoucherDraft = {
  id?: string;
  kode: string;
  jenis: VoucherType;
  nilai: number;
  maks_potongan: number | null;
  min_transaksi: number;
  service_ids: string[];
  berlaku_sampai: string | null;
  aktif: boolean;
};

export type PaymentMethodDraft = {
  id: string;
  biaya_admin: number;
  aktif: boolean;
};

export type SettingsDraft = {
  nama: string;
  tagline: string;
  warna_utama: string;
  wa_cs: string;
  batas_bayar_menit: number;
  maks_order_pending: number;
  logo_url: string | null;
  qris_image_url: string | null;
  paymentMethods: PaymentMethodDraft[];
};
