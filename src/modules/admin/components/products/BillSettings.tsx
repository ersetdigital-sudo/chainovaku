"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "../../icons";
import { saveBillSettingsAction } from "../../data/actions/products";
import { toNumber } from "../../lib/format";
import { onlyDigits } from "../../lib/utils";
import type { AdminBrand, ServiceRow } from "../../types";
import { useToast } from "../providers/ToastProvider";
import { RupiahInput } from "../ui/RupiahInput";

export function BillSettings({
  brand,
  service,
}: {
  brand: AdminBrand;
  service: ServiceRow;
}) {
  const router = useRouter();
  const toast = useToast();
  const [adminFee, setAdminFee] = useState(
    String(Math.round(toNumber(service.biaya_admin))),
  );
  const [supplierFee, setSupplierFee] = useState(
    String(Math.round(toNumber(service.biaya_supplier))),
  );
  const [jam, setJam] = useState(brand.jam_cek_tagihan ?? "");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const result = await saveBillSettingsAction({
      serviceId: service.id,
      biaya_admin: Number(onlyDigits(adminFee) || 0),
      biaya_supplier: Number(onlyDigits(supplierFee) || 0),
      jam_cek_tagihan: jam,
    });
    setPending(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    router.refresh();
  }

  return (
    <form className="adm-bill-settings" onSubmit={handleSubmit}>
      <div className="adm-note adm-note-info">
        Layanan tagihan dicek manual. Nominal dan denda diisi admin dari halaman
        Transaksi sebelum link bayar dikirim.
      </div>

      <div className="adm-form-grid adm-form-grid-3">
        <label className="adm-field">
          <span>Biaya admin ke pembeli</span>
          <span className="adm-input-group">
            <span>Rp</span>
            <RupiahInput
              value={adminFee}
              onValueChange={setAdminFee}
              placeholder="0"
            />
          </span>
        </label>
        <label className="adm-field">
          <span>Biaya dari supplier</span>
          <span className="adm-input-group">
            <span>Rp</span>
            <RupiahInput
              value={supplierFee}
              onValueChange={setSupplierFee}
              placeholder="0"
            />
          </span>
        </label>
        <label className="adm-field">
          <span>Jam cek tagihan</span>
          <input
            value={jam}
            onChange={(event) => setJam(event.target.value)}
            placeholder="08.00 - 21.00"
          />
          <span className="adm-hint">Berlaku untuk semua layanan tagihan brand ini.</span>
        </label>
      </div>

      <div className="adm-form-actions">
        <button type="submit" className="adm-btn" disabled={pending}>
          {pending ? (
            <Loader2 size={17} className="adm-spin" />
          ) : (
            <Save size={17} />
          )}
          {pending ? "Menyimpan..." : "Simpan pengaturan tagihan"}
        </button>
      </div>
    </form>
  );
}
