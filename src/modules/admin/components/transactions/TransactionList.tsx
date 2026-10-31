import Link from "next/link";
import { ReceiptText } from "../../icons";
import { formatRupiah, formatTime } from "../../lib/format";
import { txHref } from "../../lib/links";
import type { OrderRow, TransactionFilterKey } from "../../types";
import { EmptyState } from "../ui/EmptyState";
import { StatusPill } from "../ui/StatusPill";

export function TransactionList({
  orders,
  selectedId,
  filter,
  q,
  page,
}: {
  orders: OrderRow[];
  selectedId: string | null;
  filter: TransactionFilterKey;
  q: string;
  page: number;
}) {
  if (orders.length === 0) {
    return (
      <EmptyState
        icon={ReceiptText}
        title="Belum ada transaksi"
        description="Belum ada transaksi yang cocok dengan filter ini."
      />
    );
  }

  return (
    <div className="adm-tx-list">
      <div className="adm-tx-row adm-tx-row-head">
        <span>Referensi</span>
        <span>Produk &amp; tujuan</span>
        <span>Total &amp; status</span>
      </div>
      {orders.map((order) => (
        <Link
          key={order.id}
          href={txHref({
            status: filter,
            q,
            page,
            sel: order.id,
          })}
          className={`adm-tx-row adm-tx-row-click ${
            selectedId === order.id ? "is-selected" : ""
          }`}
          aria-current={selectedId === order.id ? "true" : undefined}
        >
          <span className="adm-tx-ref">
            <b>{order.ref}</b>
            <small title={order.created_at}>{formatTime(order.created_at)}</small>
          </span>
          <span className="adm-tx-product">
            <b>{order.nama_produk ?? order.nama_layanan}</b>
            <small>
              {order.nama_layanan} · {order.nomor_tujuan}
            </small>
          </span>
          <span className="adm-tx-total">
            <b>{order.total !== null ? formatRupiah(order.total) : "—"}</b>
            <StatusPill status={order.status} />
          </span>
        </Link>
      ))}
    </div>
  );
}
