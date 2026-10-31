# Modul Admin PPOB

Modul dashboard admin mandiri untuk repo web PPOB. Semua kode dashboard hanya ada di dua folder:

```
app/admin/      route Next.js, guard server, halaman
modules/admin/  komponen, data/query, server action, style, tipe, ikon
```

Brand dibaca dari env `BRAND_SLUG`, lalu dicocokkan dengan tabel `brands`. Nama, logo, warna, QRIS, dan aturan transaksi diambil dari database.

## Cara pasang di repo brand lain

1. Salin dua folder berikut ke repo brand:
   - `app/admin/`
   - `modules/admin/`
2. Pastikan repo memakai **Next.js 15+ App Router** dan **React 19** (modul ini dibuat dan diuji di Next.js 16). Jangan pakai Pages Router.
3. Pastikan alias import `@/*` mengarah ke root repo. Jika brand repo memakai alias lain, sesuaikan import `@/modules/admin/...` di file `app/admin`.
4. Pasang dependensi:

```bash
npm install @supabase/supabase-js @supabase/ssr lucide-react @fontsource/inter
```

5. Isi env di `.env.local` (jangan commit):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
BRAND_SLUG=slug-brand-di-tabel-brands
# Opsional, untuk link reset password di email Supabase:
NEXT_PUBLIC_SITE_URL=https://domain-brand.com
```

6. Tabel, function, RLS, dan bucket storage **tidak disalin**. Semua migration hanya ada di repo master `ludovex-digital` dan sudah diterapkan ke project Supabase bersama. Jangan jalankan migration baru dari repo brand.
7. Pastikan baris `brands` untuk brand ini sudah punya `slug` yang sama dengan `BRAND_SLUG`, dan sudah ada admin aktif di tabel `admins` (`brand_id` brand tersebut, `aktif = true`), atau akun `super_admin`.
8. Di Supabase Auth:
   - matikan public signup;
   - tambahkan `https://domain-brand.com/admin/reset-password` ke Redirect URLs agar email reset password bisa dibuka.
9. Deploy/build seperti biasa:

```bash
npm run build
```

## Yang tidak boleh dilakukan

- Jangan import komponen, font, style, atau helper dari kode web ke modul admin. Modul harus tetap mandiri.
- Jangan pakai service role key di browser atau di komponen client.
- Jangan update tabel `orders` langsung dari client. Perubahan status wajib lewat `update_order_status` atau `set_bill_amount`.
- Jangan menaruh query database di komponen. Query dan server action ada di `modules/admin/data`.
- Jangan menyalin folder migration ke repo brand.

## Isolasi tampilan

- Semua class memakai prefix `adm-` dan berada di bawah `.admin-root`.
- Style modul ada di `modules/admin/styles/` dan diimpor oleh `app/admin/layout.tsx`.
- Font Inter dimuat lewat `@fontsource/inter`, hanya dipakai di dalam `.admin-root`.
- Header/footer web disembunyikan hanya saat halaman admin aktif:

```css
body:has(.admin-root) > header,
body:has(.admin-root) > footer {
  display: none !important;
}
```

Jika brand repo membungkus header/footer dengan elemen lain (bukan child langsung `<body>`), sesuaikan dua selector tersebut di `modules/admin/styles/admin.css`.

## Struktur folder

```
app/admin/
  layout.tsx                 layout admin, font, CSS, noindex
  login/                     login + reset link
  reset-password/            form password baru dari email Supabase
  auth/sign-out/route.ts     logout
  (dashboard)/               halaman yang dijaga server
    layout.tsx               guard + sidebar/drawer + badge transaksi
    page.tsx                 dashboard
    transaksi/                daftar, detail, export CSV
    produk/                   layanan, nominal, harga, pengaturan tagihan
    voucher/                  daftar + form voucher
    pengaturan/               pembayaran, QRIS, brand, aturan
    pengaturan/upload/        upload logo/QRIS ke storage

modules/admin/
  components/                UI, layout, halaman
  data/                      query Supabase + server action
  lib/                       format Rupiah/tanggal, helper
  styles/                    CSS admin
  constants.ts, types.ts, icons.ts
  README.md
```

## Data dan keamanan

- Halaman dashboard dicek di server: user harus login dan lolos `is_brand_admin` untuk brand dari `BRAND_SLUG`, atau `super_admin`.
- `/admin/reset-password` adalah bagian alur login (dibuka dari email Supabase) sehingga tidak memakai guard dashboard. Form hanya bisa menyimpan password jika Supabase membuat sesi recovery dari link email.
- Admin brand lain, akun nonaktif, dan user tanpa baris `admins` ditolak.
- Pembacaan data memakai session user + RLS, bukan service role.
- Upload logo/QRIS memakai bucket `brand-logos` dan `brand-qris` dengan folder `<brand_id>/`, maksimal 2 MB, PNG/JPG.
- Semua halaman `/admin` diberi metadata `noindex, nofollow`.
