"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "../../icons";
import { saveVoucherAction } from "../../data/actions/vouchers";
import { formatRupiah, toNumber } from "../../lib/format";
import { cn, onlyDigits } from "../../lib/utils";
import type {
  ServiceRow,
  VoucherDraft,
  VoucherRow,
  VoucherType,
} from "../../types";
import { RupiahInput } from "../ui/RupiahInput";
import { useToast } from "../providers/ToastProvider";

export function VoucherForm({
  voucher,
  services,
  onSaved,
  onCancelEdit,
}: {
  voucher: VoucherRow | null;
  services: ServiceRow[];
  onSaved: (mode: "create" | "edit") => void;
  onCancelEdit: () => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [kode, setKode] = useState(voucher?.kode ?? "");
  const [jenis, setJenis] = useState<VoucherType>(voucher?.jenis ?? "persen");
  const [nilai, setNilai] = useState(
    voucher ? String(Math.round(toNumber(voucher.nilai))) : "",
  );
  const [maks, setMaks] = useState(
    voucher?.maks_potongan
      ? String(Math.round(toNumber(voucher.maks_potongan)))
      : "",
  );
  const [min, setMin] = useState(
    voucher && toNumber(voucher.min_transaksi) > 0
      ? String(Math.round(toNumber(voucher.min_transaksi)))
      : "",
  );
  const [scope, setScope] = useState<"all" | "some">(
    voucher && voucher.service_ids.length > 0 ? "some" : "all",
  );
  const [selectedServices, setSelectedServices] = useState<string[]>(
    voucher?.service_ids ?? [],
  );
  const [berlaku, setBerlaku] = useState(voucher?.berlaku_sampai ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const toggleService = (id: string) => {
    setSelectedServices((current) =>
      current.includes(id)
        ? current.filter((serviceId) => serviceId !== id)
        : [...current, id],
    );
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const code = kode.trim().toUpperCase();
    if (!/^[A-Z0-9]{3,24}$/.test(code)) {
      setError("Kode voucher 3–24 karakter, hanya huruf dan angka.");
      return;
    }
    const nilaiValue = Number(onlyDigits(nilai) || 0);
    if (nilaiValue <= 0) {
      setError("Nilai voucher harus lebih dari 0.");
      return;
    }
    if (jenis === "persen" && nilaiValue > 100) {
      setError("Persen voucher maksimal 100%.");
      return;
    }
    if (scope === "some" && selectedServices.length === 0) {
      setError("Pilih minimal satu layanan.");
      return;
    }

    const draft: VoucherDraft = {
      id: voucher?.id,
      kode: code,
      jenis,
      nilai: nilaiValue,
      maks_potongan:
        jenis === "persen" && maks ? Number(onlyDigits(maks) || 0) : null,
      min_transaksi: jenis === "tetap" ? Number(onlyDigits(min) || 0) : 0,
      service_ids: scope === "all" ? [] : selectedServices,
      berlaku_sampai: berlaku || null,
      aktif: voucher?.aktif ?? true,
    };

    setPending(true);
    const result = await saveVoucherAction(draft);
    setPending(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    toast.success(result.message);
    router.refresh();
    onSaved(voucher ? "edit" : "create");
  }

  return (
    <form className="adm-voucher-form" onSubmit={handleSubmit}>
      <div className="adm-voucher-form-head">
        <h2>{voucher ? `Edit ${voucher.kode}` : "Buat voucher"}</h2>
        <p className="adm-hint">
          Kode otomatis disimpan dalam huruf besar. Voucher berlaku di checkout.
        </p>
      </div>

      {error ? (
        <div className="adm-form-error" role="alert">
          {error}
        </div>
      ) : null}

      <label className="adm-field">
        <span>Kode</span>
        <input
          value={kode}
          onChange={(event) =>
            setKode(
              event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""),
            )
          }
          placeholder="Contoh: HEMAT10"
          className="adm-mono"
          maxLength={24}
          required
        />
      </label>

      <div className="adm-field">
        <span>Jenis potongan</span>
        <div className="adm-seg adm-voucher-type">
          <button
            type="button"
            className={cn("adm-seg-btn", jenis === "persen" && "is-active")}
            onClick={() => setJenis("persen")}
          >
            Persen
          </button>
          <button
            type="button"
            className={cn("adm-seg-btn", jenis === "tetap" && "is-active")}
            onClick={() => setJenis("tetap")}
          >
            Potongan tetap
          </button>
        </div>
      </div>

      <div className="adm-form-grid">
        <label className="adm-field">
          <span>{jenis === "persen" ? "Persen" : "Potongan"}</span>
          {jenis === "persen" ? (
            <input
              inputMode="numeric"
              value={nilai}
              onChange={(event) => setNilai(onlyDigits(event.target.value))}
              placeholder="20"
            />
          ) : (
            <span className="adm-input-group">
              <span>Rp</span>
              <RupiahInput
                value={nilai}
                onValueChange={setNilai}
                placeholder="5.000"
              />
            </span>
          )}
        </label>

        {jenis === "persen" ? (
          <label className="adm-field">
            <span>Maks. potongan</span>
            <span className="adm-input-group">
              <span>Rp</span>
              <RupiahInput
                value={maks}
                onValueChange={setMaks}
                placeholder="20.000"
              />
            </span>
            <span className="adm-hint">Kosongkan untuk tanpa batas.</span>
          </label>
        ) : (
          <label className="adm-field">
            <span>Min. transaksi</span>
            <span className="adm-input-group">
              <span>Rp</span>
              <RupiahInput
                value={min}
                onValueChange={setMin}
                placeholder="50.000"
              />
            </span>
          </label>
        )}
      </div>

      <label className="adm-field">
        <span>Berlaku untuk</span>
        <select
          className="adm-select"
          value={scope}
          onChange={(event) => setScope(event.target.value as "all" | "some")}
        >
          <option value="all">Semua layanan</option>
          <option value="some">Pilih layanan tertentu</option>
        </select>
      </label>

      {scope === "some" ? (
        <div className="adm-service-picker">
          {services.map((service) => (
            <label key={service.id} className="adm-check adm-picker-item">
              <input
                type="checkbox"
                checked={selectedServices.includes(service.id)}
                onChange={() => toggleService(service.id)}
              />
              <span>{service.nama}</span>
            </label>
          ))}
        </div>
      ) : null}

      <label className="adm-field">
        <span>Masa berlaku (opsional)</span>
        <input
          type="date"
          value={berlaku}
          onChange={(event) => setBerlaku(event.target.value)}
        />
      </label>

      {voucher ? (
        <div className="adm-voucher-usage">
          <span>
            Dipakai <b>{voucher.usage?.count ?? 0}</b> kali
          </span>
          <span>
            Total potongan{" "}
            <b>{formatRupiah(voucher.usage?.total ?? 0)}</b>
          </span>
        </div>
      ) : null}

      <button
        type="submit"
        className="adm-btn adm-btn-block"
        disabled={pending}
      >
        {pending ? (
          <Loader2 size={18} className="adm-spin" />
        ) : (
          <Save size={18} />
        )}
        {pending
          ? "Menyimpan..."
          : voucher
            ? "Simpan perubahan"
            : "Simpan voucher"}
      </button>

      {voucher ? (
        <button
          type="button"
          className="adm-link-btn adm-link-center"
          onClick={onCancelEdit}
          disabled={pending}
        >
          Batal edit, buat voucher baru
        </button>
      ) : null}
    </form>
  );
}
