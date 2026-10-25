import type { IconName } from "./icons";

export type Item = [string, string, number];

export type Field = {
  id: string;
  label: string;
  ph?: string;
  num?: boolean;
  op?: boolean;
  sel?: string[];
};

export type ServiceType = "prepaid" | "bill" | "game";

export type Service = {
  slug: string;
  name: string;
  title: string;
  description: string;
  type: ServiceType;
  fields: Field[];
  items: Item[] | null;
  admin: number | null;
  icon: { bg: string; stroke: string; name: IconName };
  blurb: string;
  how: string[];
  faq: [string, string][];
};

export const services: Service[] = [
  {
    slug: "pulsa",
    name: "Pulsa",
    title: "Pulsa",
    description:
      "Isi pulsa Telkomsel, Indosat, XL, Axis, Tri, dan Smartfren. Operator terdeteksi otomatis dari nomor yang kamu ketik.",
    type: "prepaid",
    fields: [{ id: "target", label: "Nomor HP", ph: "08xx xxxx xxxx", num: true, op: true }],
    items: [
      ["Pulsa 5rb", "", 6500],
      ["Pulsa 10rb", "", 11000],
      ["Pulsa 20rb", "", 20800],
      ["Pulsa 25rb", "", 25800],
      ["Pulsa 50rb", "", 50300],
      ["Pulsa 100rb", "", 99500],
    ],
    admin: null,
    icon: { bg: "#EDF0FA", stroke: "#2A428C", name: "phone" },
    blurb: "Pulsa semua operator, masuk otomatis.",
    how: [
      "Ketik nomor HP, operator langsung terdeteksi.",
      "Pilih nominal pulsa.",
      "Bayar, pulsa masuk dalam hitungan detik.",
    ],
    faq: [
      ["Bisa isi pulsa ke nomor orang lain?", "Bisa. Cukup ketik nomor tujuannya."],
      [
        "Pulsa belum masuk?",
        "Cek status pesanan di halaman sukses. Kalau gagal, dana dikembalikan otomatis.",
      ],
    ],
  },
  {
    slug: "paket-data",
    name: "Paket Data",
    title: "Paket Data",
    description:
      "Paket internet harian, mingguan, sampai bulanan untuk semua operator. Kuota langsung aktif setelah pembayaran.",
    type: "prepaid",
    fields: [{ id: "target", label: "Nomor HP", ph: "08xx xxxx xxxx", num: true, op: true }],
    items: [
      ["2GB", "Aktif 1 hari", 6000],
      ["5GB", "Aktif 7 hari", 25000],
      ["10GB", "Aktif 30 hari", 45000],
      ["15GB", "Aktif 30 hari", 60000],
      ["25GB", "Aktif 30 hari", 85000],
      ["50GB", "Aktif 30 hari", 130000],
    ],
    admin: null,
    icon: { bg: "#EDF0FA", stroke: "#2A428C", name: "wifi" },
    blurb: "Kuota harian sampai bulanan.",
    how: ["Ketik nomor HP.", "Pilih paket sesuai kebutuhan.", "Bayar, kuota langsung aktif."],
    faq: [
      ["Kuota bisa dipakai kapan?", "Langsung setelah transaksi berhasil."],
      ["Bisa beli paket untuk nomor lain?", "Bisa, ketik nomor tujuannya."],
    ],
  },
  {
    slug: "e-wallet",
    name: "E-Wallet",
    title: "E-Wallet",
    description:
      "Top up saldo DANA, OVO, GoPay, ShopeePay, dan LinkAja tanpa harus ke minimarket.",
    type: "prepaid",
    fields: [
      { id: "provider", label: "Pilih e-wallet", sel: ["DANA", "OVO", "GoPay", "ShopeePay", "LinkAja"] },
      { id: "target", label: "Nomor terdaftar", ph: "08xx xxxx xxxx", num: true },
    ],
    items: [
      ["Saldo 10rb", "", 11000],
      ["Saldo 25rb", "", 26000],
      ["Saldo 50rb", "", 51000],
      ["Saldo 100rb", "", 101000],
      ["Saldo 200rb", "", 201000],
      ["Saldo 500rb", "", 501000],
    ],
    admin: null,
    icon: { bg: "#EDF0FA", stroke: "#2A428C", name: "card" },
    blurb: "Isi saldo lima dompet digital.",
    how: ["Pilih e-wallet dan ketik nomornya.", "Pilih nominal saldo.", "Bayar, saldo langsung bertambah."],
    faq: [
      [
        "Akun e-wallet harus premium?",
        "Untuk saldo besar, beberapa e-wallet mensyaratkan akun premium.",
      ],
      [
        "Salah ketik nomor?",
        "Pastikan nomor benar sebelum bayar. Top up ke nomor salah tidak bisa dibatalkan.",
      ],
    ],
  },
  {
    slug: "pln",
    name: "Token & Tagihan PLN",
    title: "Token & Tagihan PLN",
    description:
      "Beli token listrik prabayar semua daya. Kode 20 digit langsung muncul setelah pembayaran.",
    type: "prepaid",
    fields: [
      { id: "target", label: "Nomor meter / ID pelanggan", ph: "Contoh: 5123 4567 8901", num: true },
    ],
    items: [
      ["Token 20rb", "", 20800],
      ["Token 50rb", "", 50300],
      ["Token 100rb", "", 100300],
      ["Token 200rb", "", 200300],
      ["Token 500rb", "", 500300],
      ["Token 1jt", "", 1000300],
    ],
    admin: null,
    icon: { bg: "#FFEF4D", stroke: "#1D2650", name: "bolt" },
    blurb: "Token listrik langsung terbit.",
    how: ["Ketik nomor meter.", "Pilih nominal token.", "Bayar, kode token langsung tampil."],
    faq: [
      [
        "Di mana nomor meter saya?",
        "Tertera di stiker meteran listrik, 11 sampai 12 digit.",
      ],
      [
        "Ada promo token?",
        "Pakai kode CHAINOVA10 untuk cashback 10%, maks. Rp10.000.",
      ],
    ],
  },
  {
    slug: "pdam",
    name: "PDAM",
    title: "PDAM",
    description:
      "Bayar tagihan air PDAM dari berbagai kota dan kabupaten. Cek tagihan dulu, baru bayar.",
    type: "bill",
    fields: [
      {
        id: "provider",
        label: "Wilayah PDAM",
        sel: [
          "PDAM Kota Bandung",
          "PDAM Kota Surabaya",
          "PAM Jaya Jakarta",
          "PDAM Kota Semarang",
          "PDAM Kota Medan",
        ],
      },
      { id: "target", label: "ID pelanggan", ph: "Nomor pelanggan PDAM", num: true },
    ],
    items: null,
    admin: 2500,
    icon: { bg: "#EDF0FA", stroke: "#2A428C", name: "drop" },
    blurb: "Cek dan bayar tagihan air.",
    how: [
      "Pilih wilayah PDAM dan ketik ID pelanggan.",
      "Cek tagihan bulan ini.",
      "Bayar, bukti pembayaran langsung terbit.",
    ],
    faq: [
      ["Kapan sebaiknya bayar?", "Sebelum tanggal 20 setiap bulan agar terhindar dari denda."],
      ["Ada biaya admin?", "Ada, ditampilkan sebelum kamu bayar."],
    ],
  },
  {
    slug: "tv-internet",
    name: "TV & Internet",
    title: "TV & Internet",
    description: "Bayar tagihan internet rumah dan TV kabel bulanan dalam satu tempat.",
    type: "bill",
    fields: [
      {
        id: "provider",
        label: "Penyedia layanan",
        sel: ["IndiHome", "First Media", "Biznet", "MyRepublic", "MNC Vision"],
      },
      { id: "target", label: "Nomor pelanggan", ph: "Nomor pelanggan", num: true },
    ],
    items: null,
    admin: 2500,
    icon: { bg: "#EDF0FA", stroke: "#2A428C", name: "tv" },
    blurb: "Bayar internet & TV bulanan.",
    how: ["Pilih penyedia dan ketik nomor pelanggan.", "Cek tagihan.", "Bayar, layanan tetap aktif."],
    faq: [
      [
        "Pembayaran tercatat kapan?",
        "Umumnya langsung, paling lama 1x24 jam di sistem penyedia.",
      ],
      [
        "Bisa bayar tagihan bulan lalu?",
        "Bisa, total tunggakan akan muncul saat cek tagihan.",
      ],
    ],
  },
  {
    slug: "top-up-game",
    name: "Top Up Game",
    title: "Top Up Game",
    description:
      "Top up Mobile Legends, Free Fire, PUBG Mobile, Honor of Kings, Roblox, dan Genshin Impact. Cukup masukkan User ID.",
    type: "game",
    fields: [],
    items: null,
    admin: null,
    icon: { bg: "#FFEF4D", stroke: "#1D2650", name: "gamepad" },
    blurb: "Diamond, UC, dan crystal.",
    how: ["Pilih game dan masukkan User ID.", "Pilih jumlah diamond atau UC.", "Bayar, item langsung masuk ke akun."],
    faq: [
      ["Di mana cari User ID?", "Buka profil di dalam game, User ID tertera di bawah nama."],
      ["Perlu password akun?", "Tidak. Kami hanya butuh User ID."],
    ],
  },
  {
    slug: "bpjs-kesehatan",
    name: "BPJS Kesehatan",
    title: "BPJS Kesehatan",
    description: "Bayar iuran BPJS Kesehatan untuk satu keluarga, bisa langsung 1 sampai 3 bulan.",
    type: "bill",
    fields: [
      { id: "target", label: "Nomor VA keluarga", ph: "88888 + nomor kartu", num: true },
      { id: "provider", label: "Bayar untuk", sel: ["1 bulan", "2 bulan", "3 bulan"] },
    ],
    items: null,
    admin: 2500,
    icon: { bg: "#EDF0FA", stroke: "#2A428C", name: "shield" },
    blurb: "Iuran keluarga, 1–3 bulan.",
    how: [
      "Ketik nomor VA keluarga.",
      "Pilih jumlah bulan, lalu cek tagihan.",
      "Bayar, status kepesertaan aktif.",
    ],
    faq: [
      ["Nomor VA itu apa?", "Angka 88888 diikuti nomor kartu BPJS kepala keluarga."],
      ["Bisa bayar untuk semua anggota?", "Ya, satu VA mencakup seluruh anggota keluarga."],
    ],
  },
  {
    slug: "multifinance",
    name: "Multifinance",
    title: "Multifinance",
    description:
      "Bayar angsuran kredit motor, mobil, dan elektronik dari berbagai perusahaan pembiayaan.",
    type: "bill",
    fields: [
      {
        id: "provider",
        label: "Perusahaan pembiayaan",
        sel: ["FIF Group", "Adira Finance", "WOM Finance", "BAF", "Mega Finance"],
      },
      { id: "target", label: "Nomor kontrak", ph: "Nomor kontrak / pelanggan", num: true },
    ],
    items: null,
    admin: 3500,
    icon: { bg: "#EDF0FA", stroke: "#2A428C", name: "bank" },
    blurb: "Angsuran kendaraan & elektronik.",
    how: [
      "Pilih perusahaan dan ketik nomor kontrak.",
      "Cek angsuran bulan ini.",
      "Bayar sebelum jatuh tempo.",
    ],
    faq: [
      [
        "Kapan pembayaran tercatat?",
        "Umumnya langsung tercatat di sistem perusahaan pembiayaan.",
      ],
      ["Bisa bayar denda sekalian?", "Ya, denda keterlambatan ikut tampil saat cek tagihan."],
    ],
  },
];

export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug);
