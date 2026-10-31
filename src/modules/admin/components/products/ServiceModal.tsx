"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Pencil,
  Plus,
  X,
} from "../../icons";
import {
  createServiceAction,
  updateServiceAction,
} from "../../data/actions/products";
import type {
  ServiceDraft,
  ServiceFieldDraft,
  ServiceRow,
} from "../../types";
import { Modal } from "../ui/Modal";
import { useToast } from "../providers/ToastProvider";

const EMPTY_FIELD: ServiceFieldDraft = {
  label: "",
  placeholder: "",
  wajib: true,
};

export function ServiceModal({
  service,
  onClose,
  onCreated,
}: {
  service: ServiceRow | null;
  onClose: () => void;
  onCreated?: (id: string) => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [nama, setNama] = useState(service?.nama ?? "");
  const [jenis, setJenis] = useState(service?.jenis ?? "nominal");
  const [urutan, setUrutan] = useState(
    service ? String(service.urutan) : "0",
  );
  const [aktif, setAktif] = useState(service?.aktif ?? true);
  const [fields, setFields] = useState<ServiceFieldDraft[]>(
    service?.input_fields?.length
      ? service.input_fields.map((field) => ({
          key: field.key,
          label: field.label,
          placeholder: field.placeholder ?? "",
          wajib: field.wajib,
        }))
      : [{ ...EMPTY_FIELD }],
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const updateField = (
    index: number,
    patch: Partial<ServiceFieldDraft>,
  ) => {
    setFields((current) =>
      current.map((field, fieldIndex) =>
        fieldIndex === index ? { ...field, ...patch } : field,
      ),
    );
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!nama.trim()) {
      setError("Nama layanan wajib diisi.");
      return;
    }
    if (fields.some((field) => !field.label.trim())) {
      setError("Semua kolom input harus punya label.");
      return;
    }
    if (fields.length === 0) {
      setError("Tambahkan minimal satu kolom input pembeli.");
      return;
    }

    const draft: ServiceDraft = {
      nama: nama.trim(),
      jenis,
      urutan: Number(urutan) || 0,
      aktif,
      inputFields: fields,
    };

    setPending(true);
    const result = service
      ? await updateServiceAction(service.id, draft)
      : await createServiceAction(draft);
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    toast.success(result.message);
    router.refresh();
    if (!service && result.data?.id) onCreated?.(result.data.id);
    onClose();
  }

  return (
    <Modal
      size="lg"
      title={service ? "Edit layanan" : "Tambah layanan"}
      subtitle="Kolom input dipakai pembeli saat checkout."
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
            form="adm-service-form"
            className="adm-btn"
            disabled={pending}
          >
            {pending ? <Loader2 size={17} className="adm-spin" /> : <Plus size={17} />}
            {pending ? "Menyimpan..." : service ? "Simpan layanan" : "Tambah layanan"}
          </button>
        </>
      }
    >
      <form id="adm-service-form" className="adm-service-form" onSubmit={handleSubmit}>
        {error ? (
          <div className="adm-form-error" role="alert">
            {error}
          </div>
        ) : null}

        <div className="adm-form-grid">
          <label className="adm-field">
            <span>Nama layanan</span>
            <input
              value={nama}
              onChange={(event) => setNama(event.target.value)}
              placeholder="Contoh: Pulsa"
              required
            />
          </label>
          <label className="adm-field">
            <span>Jenis</span>
            <select
              className="adm-select"
              value={jenis}
              onChange={(event) =>
                setJenis(event.target.value as ServiceDraft["jenis"])
              }
            >
              <option value="nominal">Nominal</option>
              <option value="tagihan">Tagihan (cek manual)</option>
            </select>
          </label>
          <label className="adm-field">
            <span>Urutan</span>
            <input
              type="number"
              value={urutan}
              onChange={(event) => setUrutan(event.target.value)}
              min={0}
            />
          </label>
          <label className="adm-check adm-check-inline">
            <input
              type="checkbox"
              checked={aktif}
              onChange={(event) => setAktif(event.target.checked)}
            />
            <span>Tampilkan layanan di web</span>
          </label>
        </div>

        <div className="adm-fields-editor">
          <div className="adm-fields-head">
            <div>
              <b>Kolom input pembeli</b>
              <p className="adm-hint">
                Bisa lebih dari satu, misalnya User ID dan Zone ID untuk game.
              </p>
            </div>
            <button
              type="button"
              className="adm-btn adm-btn-out adm-btn-sm"
              onClick={() => setFields((current) => [...current, { ...EMPTY_FIELD }])}
            >
              <Plus size={15} />
              Tambah kolom
            </button>
          </div>

          {fields.map((field, index) => (
            <div key={`field-${index}`} className="adm-field-row">
              <label className="adm-field">
                <span>Label</span>
                <input
                  value={field.label}
                  onChange={(event) =>
                    updateField(index, { label: event.target.value })
                  }
                  placeholder="Contoh: User ID"
                  required
                />
              </label>
              <label className="adm-field">
                <span>Placeholder</span>
                <input
                  value={field.placeholder}
                  onChange={(event) =>
                    updateField(index, { placeholder: event.target.value })
                  }
                  placeholder="Contoh: 12345678"
                />
              </label>
              <label className="adm-check">
                <input
                  type="checkbox"
                  checked={field.wajib}
                  onChange={(event) =>
                    updateField(index, { wajib: event.target.checked })
                  }
                />
                <span>Wajib</span>
              </label>
              <button
                type="button"
                className="adm-icon-btn"
                onClick={() =>
                  setFields((current) =>
                    current.filter((_, fieldIndex) => fieldIndex !== index),
                  )
                }
                disabled={fields.length <= 1}
                aria-label="Hapus kolom"
              >
                <X size={17} />
              </button>
            </div>
          ))}
        </div>
      </form>
    </Modal>
  );
}
