"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2, QrCode, Save } from "../../icons";
import { PageHero } from "../ui/PageHero";
import { Toggle } from "../ui/Toggle";
import { BrandMark } from "../ui/BrandMark";
import { RupiahInput } from "../ui/RupiahInput";
import { ImageUpload } from "./ImageUpload";
import { useToast } from "../providers/ToastProvider";
import { saveSettingsAction } from "../../data/actions/settings";
import {
  DEADLINE_OPTIONS,
  MAX_PENDING_OPTIONS,
  paymentLogoLabel,
} from "../../constants";
import { toNumber } from "../../lib/format";
import { onlyDigits } from "../../lib/utils";
import type {
  AdminBrand,
  PaymentMethodRow,
  SettingsDraft,
} from "../../types";

type MethodState = {
  id: string;
  nama: string;
  fee: string;
  aktif: boolean;
};

export function SettingsView({
  brand,
  paymentMethods,
}: {
  brand: AdminBrand;
  paymentMethods: PaymentMethodRow[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [nama, setNama] = useState(brand.nama);
  const [tagline, setTagline] = useState(brand.tagline ?? "");
  const [wa, setWa] = useState(brand.wa_cs ?? "");
  const [logoUrl, setLogoUrl] = useState<string | null>(brand.logo_url);
  const [qrisUrl, setQrisUrl] = useState<string | null>(brand.qris_image_url);
  const [batas, setBatas] = useState(brand.batas_bayar_menit);
  const [maks, setMaks] = useState(brand.maks_order_pending);
  const [methods, setMethods] = useState<MethodState[]>(
    paymentMethods.map((method) => ({
      id: method.id,
      nama: method.nama,
      fee: String(Math.round(toNumber(method.biaya_admin))),
      aktif: method.aktif,
    })),
  );
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);

  const deadlineOptions = DEADLINE_OPTIONS.some(
    (option) => option.value === batas,
  )
    ? DEADLINE_OPTIONS
    : [...DEADLINE_OPTIONS, { value: batas, label: `${batas} menit` }];

  const pendingOptions = MAX_PENDING_OPTIONS.includes(maks)
    ? MAX_PENDING_OPTIONS
    : [...MAX_PENDING_OPTIONS, maks];

  function updateMethod(id: string, patch: Partial<MethodState>) {
    setMethods((current) =>
      current.map((method) =>
        method.id === id ? { ...method, ...patch } : method,
      ),
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!nama.trim()) {
      toast.error("Nama brand wajib diisi.");
      return;
    }
    if (wa && onlyDigits(wa).length < 8) {
      toast.error("Nomor WhatsApp CS tidak valid.");
      return;
    }

    const draft: SettingsDraft = {
      nama: nama.trim(),
      tagline: tagline.trim(),
      warna_utama: brand.warna_utama ?? "#3B4FD8",
      wa_cs: wa,
      batas_bayar_menit: batas,
      maks_order_pending: maks,
      logo_url: logoUrl,
      qris_image_url: qrisUrl,
      paymentMethods: methods.map((method) => ({
        id: method.id,
        biaya_admin: Number(onlyDigits(method.fee) || 0),
        aktif: method.aktif,
      })),
    };

    setPending(true);
    const result = await saveSettingsAction(draft);
    setPending(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    router.refresh();
  }

  return (
    <div className="adm-page">
      <PageHero
        icon={CreditCard}
        title="Pembayaran & Brand"
        subtitle="Atur pembayaran, QRIS, dan identitas dashboard"
        actions={
          <button
            type="submit"
            form="adm-settings-form"
            className="adm-btn"
            disabled={pending || uploading}
          >
            {pending ? (
              <Loader2 size={18} className="adm-spin" />
            ) : (
              <Save size={18} />
            )}
            {pending ? "Menyimpan..." : "Simpan perubahan"}
          </button>
        }
      />

      <form id="adm-settings-form" onSubmit={handleSubmit}>
        <div className="adm-grid adm-grid-2 adm-settings-grid">
          <div className="adm-card">
            <h2>Metode bayar</h2>
            <p className="adm-hint adm-card-intro">
              Yang dimatikan tidak muncul di form checkout.
            </p>
            <div className="adm-pm-list">
              {methods.length === 0 ? (
                <p className="adm-hint">Belum ada metode bayar.</p>
              ) : (
                methods.map((method) => (
                  <div className="adm-pm-row" key={method.id}>
                    <span className="adm-pm-logo">
                      {paymentLogoLabel(method.nama)}
                    </span>
                    <span className="adm-pm-main">
                      <b>{method.nama}</b>
                      <span className="adm-pm-fee">
                        <span>Biaya admin</span>
                        <span className="adm-input-group adm-input-group-sm">
                          <span>Rp</span>
                          <RupiahInput
                            value={method.fee}
                            onValueChange={(fee) =>
                              updateMethod(method.id, { fee })
                            }
                            aria-label={`Biaya admin ${method.nama}`}
                          />
                        </span>
                      </span>
                    </span>
                    <Toggle
                      checked={method.aktif}
                      onChange={(aktif) => updateMethod(method.id, { aktif })}
                      disabled={pending}
                      label={`${method.aktif ? "Nonaktifkan" : "Aktifkan"} ${method.nama}`}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="adm-settings-column">
            <div className="adm-card adm-qris-card">
              <h2>Gambar QRIS</h2>
              <div className="adm-qris-row">
                <div className="adm-qris-preview">
                  {qrisUrl ? (
                    <img src={qrisUrl} alt="Gambar QRIS brand" />
                  ) : (
                    <>
                      <QrCode size={34} />
                      <span>Belum ada gambar QRIS</span>
                    </>
                  )}
                </div>
                <div className="adm-qris-actions">
                  <b className="adm-file-name">
                    {qrisUrl
                      ? decodeURIComponent(qrisUrl.split("/").pop() ?? "qris.jpg")
                      : "Gambar QRIS belum diatur"}
                  </b>
                  <span className="adm-hint">PNG atau JPG, maks 2 MB</span>
                  <ImageUpload
                    kind="qris"
                    label="Ganti gambar"
                    disabled={pending}
                    onUploaded={setQrisUrl}
                    onUploadingChange={setUploading}
                  />
                </div>
              </div>
            </div>

            <div className="adm-card adm-wa-card">
              <h2>WhatsApp CS</h2>
              <label className="adm-field">
                <span>Nomor penerima bukti bayar</span>
                <input
                  type="tel"
                  value={wa}
                  onChange={(event) => setWa(event.target.value)}
                  placeholder="0857-1117-2317"
                  inputMode="tel"
                />
              </label>
              <div className="adm-note adm-note-ok adm-wa-example">
                {`Halo CS ${nama}, saya ingin konfirmasi pembayaran:
Kode referensi: REF-${brand.kode_ref}-000001
Produk: Token PLN 100.000
Total: Rp101.500`}
              </div>
            </div>
          </div>

          <div className="adm-card adm-brand-card">
            <h2>Identitas brand</h2>
            <div className="adm-logo-block">
              <div className="adm-logo-row">
                <BrandMark
                  name={nama || brand.nama}
                  logoUrl={logoUrl}
                  color={brand.warna_utama}
                  size="lg"
                />
                <ImageUpload
                  kind="logo"
                  label="Upload logo"
                  disabled={pending}
                  small
                  onUploaded={setLogoUrl}
                  onUploadingChange={setUploading}
                />
              </div>
              <p className="adm-hint">
                Panduan logo: 512×512 px (rasio 1:1), minimal 128×128 px,
                PNG transparan atau JPG, maks. 2 MB. Logo tampil di dashboard
                admin.
              </p>
            </div>
            <div className="adm-brand-fields">
              <label className="adm-field">
                <span>Nama brand</span>
                <input
                  value={nama}
                  onChange={(event) => setNama(event.target.value)}
                  required
                />
              </label>
              <label className="adm-field">
                <span>Tagline</span>
                <input
                  value={tagline}
                  onChange={(event) => setTagline(event.target.value)}
                  placeholder="Semua pembayaran digital, satu tempat"
                />
              </label>
            </div>
          </div>

          <div className="adm-card adm-rules-card">
            <h2>Aturan transaksi</h2>
            <div className="adm-rule-row">
              <span className="adm-rule-copy">
                <b>Batas waktu bayar</b>
                <small>Lewat dari ini transaksi batal otomatis</small>
              </span>
              <select
                className="adm-select"
                value={batas}
                onChange={(event) => setBatas(Number(event.target.value))}
              >
                {deadlineOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="adm-rule-row">
              <span className="adm-rule-copy">
                <b>Batas transaksi belum bayar</b>
                <small>Per nomor tujuan, biar tidak dispam</small>
              </span>
              <select
                className="adm-select"
                value={maks}
                onChange={(event) => setMaks(Number(event.target.value))}
              >
                {pendingOptions.map((value) => (
                  <option key={value} value={value}>
                    {value} transaksi
                  </option>
                ))}
              </select>
            </div>
            <p className="adm-hint">
              Aturan baru berlaku untuk transaksi yang dibuat setelah disimpan.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
