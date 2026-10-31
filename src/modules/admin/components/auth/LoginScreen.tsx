import {
  ChartNoAxesColumnIncreasing,
  ClipboardCheck,
  LockKeyhole,
  ShieldCheck,
  SlidersHorizontal,
  Store,
} from "../../icons";
import type { PublicBrand } from "../../types";
import { BrandMark } from "../ui/BrandMark";
import { LoginForm } from "./LoginForm";

export function LoginScreen({
  brand,
  initialError,
}: {
  brand: PublicBrand;
  initialError?: string;
}) {
  const brandColor = brand.warna_utama || "#3B4FD8";
  return (
    <div
      className="adm-login-screen"
      style={{ "--adm-brand": brandColor } as React.CSSProperties}
    >
      <section className="adm-login-left" aria-label="Tentang dashboard">
        <div className="adm-login-brand">
          <BrandMark
            name={brand.nama}
            logoUrl={brand.logo_url}
            color={brandColor}
            size="md"
          />
          <div>
            <b>{brand.nama}</b>
            <span>ADMIN PANEL</span>
          </div>
        </div>

        <div className="adm-login-copy">
          <span className="adm-login-deco" aria-hidden="true">
            <LockKeyhole size={30} />
          </span>
          <h1>Operasional toko digital, dalam satu dashboard.</h1>
          <p>
            Pantau transaksi, cek tagihan manual, dan atur katalog tanpa pindah
            aplikasi.
          </p>
          <ul className="adm-login-features">
            <li>
              <ChartNoAxesColumnIncreasing size={19} />
              <span>Omzet dan profit bulanan</span>
            </li>
            <li>
              <ClipboardCheck size={19} />
              <span>Cek tagihan dan kirim link bayar</span>
            </li>
            <li>
              <SlidersHorizontal size={19} />
              <span>Produk, voucher, dan pembayaran</span>
            </li>
          </ul>
        </div>

        <div className="adm-login-domain">
          <Store size={16} />
          <span>{brand.domain}</span>
        </div>
      </section>

      <section className="adm-login-right" aria-label="Form login">
        <div className="adm-login-mobile-brand">
          <BrandMark
            name={brand.nama}
            logoUrl={brand.logo_url}
            color={brandColor}
            size="sm"
          />
          <b>{brand.nama}</b>
        </div>

        <div className="adm-login-card">
          <LoginForm initialError={initialError} />
        </div>

        <p className="adm-login-footnote">
          <ShieldCheck size={15} />
          Akses khusus admin {brand.nama}
        </p>
      </section>
    </div>
  );
}

export function LoginUnavailable({
  missing,
  brandMissing,
  message,
}: {
  missing: string[];
  brandMissing: boolean;
  message?: string;
}) {
  return (
    <div className="adm-login-unavailable">
      <div className="adm-login-card">
        <span className="adm-empty-icon">
          <LockKeyhole size={24} />
        </span>
        <h1>Dashboard belum siap</h1>
        <p>
          {message ??
            (brandMissing
              ? "Brand untuk dashboard ini belum ditemukan. Pastikan migration dan seed sudah dijalankan, lalu cocokkan BRAND_SLUG."
              : "Konfigurasi Supabase untuk dashboard ini belum lengkap.")}
        </p>
        {missing.length > 0 ? (
          <div className="adm-setup-list">
            <b>Isi variabel berikut di .env.local:</b>
            <ul>
              {missing.map((key) => (
                <li key={key}>
                  <code>{key}</code>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <p className="adm-login-note">
          Setelah konfigurasi lengkap, muat ulang halaman ini.
        </p>
      </div>
    </div>
  );
}
