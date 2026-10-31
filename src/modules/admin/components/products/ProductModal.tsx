"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "../../icons";
import { saveProductAction } from "../../data/actions/products";
import { formatRupiah, toNumber } from "../../lib/format";
import { onlyDigits } from "../../lib/utils";
import type { ProductRow, ServiceRow } from "../../types";
import { Modal } from "../ui/Modal";
import { RupiahInput } from "../ui/RupiahInput";
import { useToast } from "../providers/ToastProvider";

export function ProductModal({
  service,
  product,
  onClose,
}: {
  service: ServiceRow;
  product: ProductRow | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [nama, setNama] = useState(product?.nama ?? "");
  const [modal, setModal] = useState(
    product ? String(Math.round(toNumber(product.harga_modal))) : "",
  );
  const [jual, setJual] = useState(
    product ? String(Math.round(toNumber(product.harga_jual))) : "",
  );
  const [urutan, setUrutan] = useState(product ? String(product.urutan) : "0");
  const [aktif, setAktif] = useState(product?.aktif ?? true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const costValue = Number(onlyDigits(modal) || 0);
  const priceValue = Number(onlyDigits(jual) || 0);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!nama.trim()) {
      setError("Nama nominal wajib diisi.");
      return;
    }

    setPending(true);
    const result = await saveProductAction({
      id: product?.id,
      serviceId: service.id,
      nama: nama.trim(),
      harga_modal: costValue,
      harga_jual: priceValue,
      urutan: Number(urutan) || 0,
      aktif,
    });
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    toast.success(result.message);
    router.refresh();
    onClose();
  }

  return (
    <Modal
      title={product ? "Edit nominal" : "Tambah nominal"}
      subtitle={`Layanan ${service.nama}`}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className="adm-btn adm-btn-out"
            onClick={onClose}
            disabled={pending}
          >
            Batal
          </button>
          <button
            type="submit"
            form="adm-product-form"
            className="adm-btn"
            disabled={pending}
          >
            {pending ? <Loader2 size={17} className="adm-spin" /> : <Plus size={17} />}
            {pending ? "Menyimpan..." : product ? "Simpan nominal" : "Tambah nominal"}
          </button>
        </>
      }
    >
      <form id="adm-product-form" className="adm-service-form" onSubmit={handleSubmit}>
        {error ? (
          <div className="adm-form-error" role="alert">
            {error}
          </div>
        ) : null}

        <label className="adm-field">
          <span>Nama nominal</span>
          <input
            value={nama}
            onChange={(event) => setNama(event.target.value)}
            placeholder="Contoh: Pulsa 50.000"
            required
          />
        </label>

        <div className="adm-form-grid">
          <label className="adm-field">
            <span>Harga modal</span>
            <span className="adm-input-group">
              <span>Rp</span>
              <RupiahInput
                value={modal}
                onValueChange={setModal}
                placeholder="0"
              />
            </span>
          </label>
          <label className="adm-field">
            <span>Harga jual</span>
            <span className="adm-input-group">
              <span>Rp</span>
              <RupiahInput
                value={jual}
                onValueChange={setJual}
                placeholder="0"
              />
            </span>
          </label>
          <label className="adm-field">
            <span>Urutan</span>
            <input
              type="number"
              min={0}
              value={urutan}
              onChange={(event) => setUrutan(event.target.value)}
            />
          </label>
          <label className="adm-check adm-check-inline">
            <input
              type="checkbox"
              checked={aktif}
              onChange={(event) => setAktif(event.target.checked)}
            />
            <span>Tampilkan di web</span>
          </label>
        </div>

        <div
          className={
            priceValue - costValue < 0
              ? "adm-profit-preview is-loss"
              : "adm-profit-preview"
          }
        >
          <span>Untung per transaksi</span>
          <b>{formatRupiah(priceValue - costValue)}</b>
        </div>
      </form>
    </Modal>
  );
}
