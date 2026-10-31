"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, TicketPercent } from "../../icons";
import { PageHero } from "../ui/PageHero";
import { EmptyState } from "../ui/EmptyState";
import { Toggle } from "../ui/Toggle";
import { VoucherForm } from "./VoucherForm";
import { useToast } from "../providers/ToastProvider";
import { toggleVoucherAction } from "../../data/actions/vouchers";
import { formatDate, formatRupiah } from "../../lib/format";
import { voucherRule } from "../../constants";
import type { ServiceRow, VoucherRow } from "../../types";

export function VouchersView({
  services,
  vouchers,
}: {
  services: ServiceRow[];
  vouchers: VoucherRow[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const selected = vouchers.find((voucher) => voucher.id === selectedId) ?? null;

  function selectVoucher(id: string | null) {
    setSelectedId(id);
    setVersion((current) => current + 1);
  }

  async function handleToggle(voucher: VoucherRow) {
    setPendingId(voucher.id);
    const result = await toggleVoucherAction(voucher.id, !voucher.aktif);
    setPendingId(null);
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
        icon={TicketPercent}
        title="Voucher"
        subtitle="Kode potongan yang dipakai pembeli waktu checkout"
        actions={
          <button
            type="button"
            className="adm-btn"
            onClick={() => selectVoucher(null)}
          >
            <Plus size={18} />
            Voucher baru
          </button>
        }
      />

      <div className="adm-flex adm-voucher-layout">
        <div className="adm-voucher-list">
          {vouchers.length === 0 ? (
            <div className="adm-card">
              <EmptyState
                icon={TicketPercent}
                title="Belum ada voucher"
                description="Buat kode potongan pertama untuk pembeli."
              />
            </div>
          ) : (
            vouchers.map((voucher) => (
              <article
                key={voucher.id}
                className={`adm-card adm-voucher-card ${
                  selectedId === voucher.id ? "is-selected" : ""
                }`}
              >
                <div className="adm-voucher-main">
                  <div className="adm-voucher-code-row">
                    <span className="adm-mono adm-voucher-code">
                      {voucher.kode}
                    </span>
                    <span
                      className={
                        voucher.aktif
                          ? "adm-mini-badge"
                          : "adm-mini-badge is-off"
                      }
                    >
                      {voucher.aktif ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  <b className="adm-voucher-rule">
                    {voucherRule(voucher, services)}
                  </b>
                  {voucher.berlaku_sampai ? (
                    <span className="adm-hint">
                      Berlaku sampai {formatDate(voucher.berlaku_sampai)}
                    </span>
                  ) : null}
                </div>

                <div className="adm-voucher-stats">
                  <div>
                    <span className="adm-label">Dipakai</span>
                    <b>{voucher.usage?.count ?? 0}</b>
                  </div>
                  <div>
                    <span className="adm-label">Total potongan</span>
                    <b>{formatRupiah(voucher.usage?.total ?? 0)}</b>
                  </div>
                </div>

                <div className="adm-voucher-actions">
                  <button
                    type="button"
                    className="adm-btn adm-btn-out adm-btn-sm"
                    onClick={() => selectVoucher(voucher.id)}
                  >
                    <Pencil size={15} />
                    Edit
                  </button>
                  <Toggle
                    checked={voucher.aktif}
                    onChange={() => handleToggle(voucher)}
                    disabled={pendingId === voucher.id}
                    label={`${voucher.aktif ? "Nonaktifkan" : "Aktifkan"} ${voucher.kode}`}
                  />
                  {pendingId === voucher.id ? (
                    <Loader2 size={14} className="adm-spin" />
                  ) : null}
                </div>
              </article>
            ))
          )}
        </div>

        <div className="adm-card adm-voucher-form-card">
          <VoucherForm
            key={`${selectedId ?? "new"}-${version}`}
            voucher={selected}
            services={services}
            onSaved={(mode) => {
              if (mode === "create") {
                setSelectedId(null);
                setVersion((current) => current + 1);
              }
            }}
            onCancelEdit={() => selectVoucher(null)}
          />
        </div>
      </div>
    </div>
  );
}
