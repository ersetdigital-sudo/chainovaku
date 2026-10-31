"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Ban,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Send,
} from "../../icons";
import {
  setBillAmountAction,
  updateOrderStatusAction,
} from "../../data/actions/transactions";
import {
  formatDate,
  formatDateTime,
  formatInputValue,
  formatRupiah,
  formatTime,
  formatWaDisplay,
  toNumber,
} from "../../lib/format";
import {
  buildWaUrl,
  buyerFields,
  chatMessage,
  computeVoucherDiscount,
  isCancellableStatus,
  onlyDigits,
  orderWa,
  paymentMessage,
  snResendMessage,
} from "../../lib/utils";
import { STATUS_META } from "../../constants";
import type {
  AdminBrand,
  OrderRow,
  ServiceRow,
  OrderLogRow,
  VoucherRow,
} from "../../types";
import { Modal } from "../ui/Modal";
import { RupiahInput } from "../ui/RupiahInput";
import { StatusPill } from "../ui/StatusPill";
import { useToast } from "../providers/ToastProvider";
import { Countdown } from "./Countdown";

type Busy = "bill" | "paid" | "sn" | "cancel" | null;

export function TransactionDetail({
  brand,
  order,
  service,
  voucher,
  logs,
}: {
  brand: AdminBrand;
  order: OrderRow;
  service: ServiceRow | null;
  voucher: VoucherRow | null;
  logs: OrderLogRow[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState<Busy>(null);
  const [nominal, setNominal] = useState(
    order.nominal_tagihan ? String(Math.round(toNumber(order.nominal_tagihan))) : "",
  );
  const [denda, setDenda] = useState(
    order.denda ? String(Math.round(toNumber(order.denda))) : "",
  );
  const [sn, setSn] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState("");

  const wa = orderWa(order);
  const adminFee = toNumber(order.biaya_admin);
  const potongan = toNumber(order.potongan);
  const nominalValue = Number(onlyDigits(nominal) || 0);
  const dendaValue = Number(onlyDigits(denda) || 0);
  const previewBase = nominalValue + dendaValue;
  const previewDiscount = computeVoucherDiscount(
    voucher,
    previewBase,
    order.service_id,
  );
  const previewTotal = Math.max(
    0,
    previewBase + adminFee - previewDiscount,
  );
  const inputFields = buyerFields(order, service);
  const cancellable = isCancellableStatus(order.status);
  const chatUrl = wa ? buildWaUrl(wa, chatMessage({ brand, order })) : null;
  const resendUrl = wa
    ? buildWaUrl(wa, snResendMessage({ brand, order }))
    : null;

  async function handleSetBill(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (nominalValue <= 0) {
      toast.error("Nominal tagihan harus lebih dari 0.");
      return;
    }

    const popup = window.open("", "_blank");
    setBusy("bill");
    const result = await setBillAmountAction(order.id, nominalValue, dendaValue);
    setBusy(null);

    if (!result.ok || !result.data) {
      popup?.close();
      toast.error(result.ok ? "Gagal menyimpan nominal." : result.message);
      return;
    }

    toast.success(result.message);
    const url = buildWaUrl(
      wa,
      paymentMessage({
        brand,
        order,
        total: result.data.total,
        expiresAt: result.data.expires_at,
      }),
    );

    if (!url) {
      popup?.close();
      toast.error("Nomor WhatsApp pembeli tidak tersedia.");
    } else if (popup) {
      popup.opener = null;
      popup.location.href = url;
    } else {
      window.location.href = url;
    }
    router.refresh();
  }

  async function handleMarkPaid() {
    setBusy("paid");
    const result = await updateOrderStatusAction(order.id, "sudah_bayar");
    setBusy(null);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    router.refresh();
  }

  async function handleSaveSn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sn.trim()) {
      toast.error("SN / token wajib diisi.");
      return;
    }
    setBusy("sn");
    const result = await updateOrderStatusAction(order.id, "sukses", sn);
    setBusy(null);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    router.refresh();
  }

  async function handleCancel(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reason.trim()) {
      toast.error("Alasan pembatalan wajib diisi.");
      return;
    }
    setBusy("cancel");
    const result = await updateOrderStatusAction(
      order.id,
      "dibatalkan",
      undefined,
      reason,
    );
    setBusy(null);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setCancelOpen(false);
    setReason("");
    router.refresh();
  }

  function openExternal(url: string | null) {
    if (!url) {
      toast.error("Nomor WhatsApp pembeli tidak tersedia.");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const canCancel = cancellable;

  return (
    <div className="adm-tx-detail-inner">
      <div className="adm-tx-detail-head">
        <div>
          <span className="adm-label">Detail transaksi</span>
          <b>{order.ref}</b>
        </div>
        <StatusPill status={order.status} />
      </div>

      {order.status === "menunggu_cek" ? (
        <div className="adm-note adm-note-info">
          Tagihan belum ditetapkan. Cek dulu ke supplier, lalu isi nominal dan
          denda di bawah.
        </div>
      ) : null}

      {order.status === "menunggu_bayar" ? (
        <Countdown expiresAt={order.expires_at} />
      ) : null}

      {order.status === "dibatalkan" ? (
        <div className="adm-note adm-note-muted">
          Dibatalkan{order.cancel_reason ? `: ${order.cancel_reason}` : "."}
        </div>
      ) : null}

      <dl className="adm-kv">
        <dt>Layanan</dt>
        <dd>{order.nama_layanan}</dd>
        <dt>Produk</dt>
        <dd>{order.nama_produk ?? "-"}</dd>
        <dt>Nomor tujuan</dt>
        <dd>{order.nomor_tujuan}</dd>
        <dt>WA pembeli</dt>
        <dd>{order.wa_pembeli ? formatWaDisplay(order.wa_pembeli) : "-"}</dd>
        <dt>Metode</dt>
        <dd>{order.metode_bayar ?? "-"}</dd>
        <dt>Voucher</dt>
        <dd>
          {order.voucher_kode
            ? `${order.voucher_kode} (-${formatRupiah(potongan)})`
            : "-"}
        </dd>
        <dt>Biaya admin</dt>
        <dd>{formatRupiah(adminFee)}</dd>
        <dt>Total</dt>
        <dd className="adm-kv-total">
          {order.total !== null ? formatRupiah(order.total) : "Belum ditetapkan"}
        </dd>
        <dt>Dibuat</dt>
        <dd>{formatDateTime(order.created_at)} WIB</dd>
      </dl>

      <div className="adm-detail-inputs">
        <span className="adm-label">Data pembeli</span>
        <dl className="adm-kv">
          {inputFields.map((field) => (
            <div key={field.label} className="adm-kv-pair">
              <dt>{field.label}</dt>
              <dd>{formatInputValue(field.value)}</dd>
            </div>
          ))}
        </dl>
      </div>

      {order.status === "menunggu_cek" ? (
        <form className="adm-bill-form" onSubmit={handleSetBill}>
          <div className="adm-bill-grid">
            <label className="adm-field">
              <span>Nominal tagihan</span>
              <span className="adm-input-group">
                <span>Rp</span>
                <RupiahInput
                  value={nominal}
                  onValueChange={setNominal}
                  placeholder="150.000"
                  aria-label="Nominal tagihan"
                />
              </span>
            </label>
            <label className="adm-field">
              <span>Denda</span>
              <span className="adm-input-group">
                <span>Rp</span>
                <RupiahInput
                  value={denda}
                  onValueChange={setDenda}
                  placeholder="0"
                  aria-label="Denda tagihan"
                />
              </span>
            </label>
          </div>

          <div className="adm-bill-summary">
            <span>Biaya admin</span>
            <b>{formatRupiah(adminFee)}</b>
            {previewDiscount > 0 ? (
              <>
                <span>Voucher {order.voucher_kode}</span>
                <b>-{formatRupiah(previewDiscount)}</b>
              </>
            ) : null}
            <span>Total ke pembeli</span>
            <b className="adm-bill-total">{formatRupiah(previewTotal)}</b>
          </div>
          {order.voucher_kode ? (
            <p className="adm-hint">
              Voucher {order.voucher_kode} dihitung ulang dan divalidasi saat
              nominal disimpan.
            </p>
          ) : null}

          <button
            type="submit"
            className="adm-btn adm-btn-block"
            disabled={busy !== null || nominalValue <= 0}
          >
            {busy === "bill" ? (
              <Loader2 size={18} className="adm-spin" />
            ) : (
              <Send size={18} />
            )}
            {busy === "bill"
              ? "Menyimpan..."
              : "Simpan nominal & kirim ke WA"}
          </button>
        </form>
      ) : null}

      {order.status === "menunggu_bayar" ? (
        <button
          type="button"
          className="adm-btn adm-btn-block"
          onClick={handleMarkPaid}
          disabled={busy !== null}
        >
          {busy === "paid" ? (
            <Loader2 size={18} className="adm-spin" />
          ) : (
            <CheckCircle2 size={18} />
          )}
          {busy === "paid" ? "Menyimpan..." : "Tandai sudah bayar"}
        </button>
      ) : null}

      {order.status === "sudah_bayar" ? (
        <form className="adm-sn-form" onSubmit={handleSaveSn}>
          <label className="adm-field">
            <span>SN / Token</span>
            <input
              value={sn}
              onChange={(event) => setSn(event.target.value)}
              placeholder="Isi SN atau token dari supplier"
              required
            />
            <span className="adm-hint">
              Akan tampil di halaman Cek Transaksi pembeli.
            </span>
          </label>
          <button
            type="submit"
            className="adm-btn adm-btn-block"
            disabled={busy !== null || !sn.trim()}
          >
            {busy === "sn" ? (
              <Loader2 size={18} className="adm-spin" />
            ) : (
              <CheckCircle2 size={18} />
            )}
            {busy === "sn" ? "Menyimpan..." : "Simpan SN & tandai sukses"}
          </button>
        </form>
      ) : null}

      {order.status === "sukses" ? (
        <>
          <div className="adm-note adm-note-ok">
            <span className="adm-label">SN / Token</span>
            <b className="adm-mono">{order.sn ?? "-"}</b>
          </div>
          <button
            type="button"
            className="adm-btn adm-btn-out adm-btn-block"
            onClick={() => openExternal(resendUrl)}
            disabled={!resendUrl || !order.sn}
          >
            <Send size={17} />
            Kirim ulang SN ke pembeli
          </button>
        </>
      ) : null}

      <div className="adm-detail-actions">
        {chatUrl ? (
          <a
            href={chatUrl}
            target="_blank"
            rel="noreferrer"
            className="adm-btn adm-btn-out adm-btn-sm"
          >
            <MessageCircle size={17} />
            Chat pembeli
          </a>
        ) : (
          <button
            type="button"
            className="adm-btn adm-btn-out adm-btn-sm"
            disabled
            title="Nomor WhatsApp pembeli tidak tersedia"
          >
            <MessageCircle size={17} />
            Chat pembeli
          </button>
        )}
        {canCancel ? (
          <button
            type="button"
            className="adm-btn adm-btn-danger adm-btn-sm"
            onClick={() => setCancelOpen(true)}
            disabled={busy !== null}
          >
            <Ban size={17} />
            Batalkan
          </button>
        ) : null}
      </div>

      <div className="adm-history">
        <span className="adm-label">Riwayat status</span>
        {logs.length === 0 ? (
          <p className="adm-hint">Belum ada riwayat.</p>
        ) : (
          <ul className="adm-timeline">
            {logs.map((log) => {
              const from = log.status_dari
                ? STATUS_META[log.status_dari].label
                : "Dibuat";
              const to = STATUS_META[log.status_ke].label;
              return (
                <li key={log.id}>
                  <span className="adm-timeline-time">
                    {formatTime(log.created_at)}
                  </span>
                  <span className="adm-timeline-body">
                    <b>
                      {log.status_dari
                        ? `${from} → ${to}`
                        : `Transaksi dibuat (${to})`}
                    </b>
                    <small>{formatDate(log.created_at)}</small>
                    {log.catatan ? <em>{log.catatan}</em> : null}
                    {log.admin_nama ? (
                      <small>oleh {log.admin_nama}</small>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {cancelOpen ? (
        <Modal
          title="Batalkan transaksi?"
          subtitle="Transaksi yang dibatalkan tidak bisa dikembalikan."
          onClose={() => setCancelOpen(false)}
        >
          <form id="adm-cancel-form" onSubmit={handleCancel}>
            <label className="adm-field">
              <span>Alasan pembatalan</span>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Contoh: pembeli tidak membayar / salah input"
                required
              />
            </label>
            <div className="adm-modal-foot adm-modal-foot-inline">
              <button
                type="button"
                className="adm-btn adm-btn-out"
                onClick={() => setCancelOpen(false)}
                disabled={busy === "cancel"}
              >
                Kembali
              </button>
              <button
                type="submit"
                className="adm-btn adm-btn-danger"
                disabled={busy === "cancel" || !reason.trim()}
              >
                {busy === "cancel" ? (
                  <Loader2 size={17} className="adm-spin" />
                ) : (
                  <Ban size={17} />
                )}
                {busy === "cancel" ? "Membatalkan..." : "Ya, batalkan"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
