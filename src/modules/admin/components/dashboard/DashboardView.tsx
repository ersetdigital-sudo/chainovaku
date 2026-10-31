import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Clock,
  LayoutDashboard,
  ReceiptText,
  TicketPercent,
  TrendingUp,
  Wallet,
} from "../../icons";
import {
  formatDateTime,
  formatNumber,
  formatPercent,
  formatRupiah,
  formatTime,
  toNumber,
} from "../../lib/format";
import type {
  AdminBrand,
  DashboardSummary,
  OrderRow,
} from "../../types";
import { EmptyState } from "../ui/EmptyState";
import { PageHero } from "../ui/PageHero";
import { StatusPill } from "../ui/StatusPill";
import { MonthSwitcher } from "./MonthSwitcher";
import { RefreshButton } from "./RefreshButton";

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  tone,
  tag,
}: {
  label: string;
  value: string;
  description: string;
  icon?: React.ComponentType<{ size?: number }>;
  tone?: "profit" | "loss";
  tag?: "PROFIT" | "RUGI";
}) {
  return (
    <div className="adm-stat">
      {tag ? (
        <span className={tag === "PROFIT" ? "adm-profit-tag" : "adm-profit-tag is-loss"}>
          {tag}
        </span>
      ) : null}
      <span className="adm-stat-label">
        {Icon ? <Icon size={18} /> : null}
        {label}
      </span>
      <span
        className={
          tone === "profit"
            ? "adm-stat-value is-profit"
            : tone === "loss"
              ? "adm-stat-value is-loss"
              : "adm-stat-value"
        }
      >
        {value}
      </span>
      <span className="adm-stat-desc">{description}</span>
    </div>
  );
}

export function DashboardView({
  brand,
  monthKey,
  summary,
  recent,
}: {
  brand: AdminBrand;
  monthKey: string;
  summary: DashboardSummary;
  recent: OrderRow[];
}) {
  const profit = toNumber(summary.net_profit);
  const pendingTotal = summary.menunggu_cek + summary.sudah_bayar;
  const maxPopular = Math.max(
    1,
    ...summary.layanan_terlaris.map((item) => item.jumlah),
  );

  return (
    <div className="adm-page">
      <PageHero
        icon={LayoutDashboard}
        title="Dashboard"
        subtitle={`Ringkasan transaksi ${brand.nama}`}
        actions={
          <>
            <MonthSwitcher monthKey={monthKey} />
            <RefreshButton />
            <Link href="/admin/transaksi" className="adm-btn adm-btn-out">
              Lihat transaksi <ArrowRight size={18} />
            </Link>
          </>
        }
      >
        <div className="adm-grid adm-grid-4">
          <StatCard
            label="Omzet lunas"
            value={formatRupiah(summary.omzet)}
            description="Dari transaksi sukses"
            icon={Wallet}
          />
          <StatCard
            label="Total modal"
            value={formatRupiah(summary.total_modal)}
            description="Modal produk terjual"
            icon={Boxes}
          />
          <StatCard
            label="Potongan voucher"
            value={formatRupiah(summary.total_potongan_voucher)}
            description="Total potongan bulan ini"
            icon={TicketPercent}
          />
          <StatCard
            label="Net profit"
            value={formatRupiah(summary.net_profit)}
            description="Keuntungan bersih"
            icon={TrendingUp}
            tone={profit >= 0 ? "profit" : "loss"}
            tag={profit >= 0 ? "PROFIT" : "RUGI"}
          />
        </div>
      </PageHero>

      <div className="adm-grid adm-grid-3">
        <StatCard
          label="Total transaksi"
          value={formatNumber(summary.jumlah_transaksi)}
          description="transaksi bulan ini"
        />
        <StatCard
          label="Rata-rata / transaksi"
          value={formatRupiah(summary.rata_rata)}
          description="nilai rata-rata"
        />
        <StatCard
          label="Tingkat batal"
          value={formatPercent(summary.persentase_batal)}
          description="dari transaksi bulan ini"
        />
      </div>

      <Link href="/admin/transaksi" className="adm-card adm-alert-row">
        <span className="adm-alert-icon">
          <Clock size={24} />
        </span>
        <span className="adm-alert-copy">
          <b>Transaksi perlu diproses</b>
          <span className="adm-label">
            {summary.sudah_bayar} sudah bayar · {summary.menunggu_cek} cek tagihan
          </span>
        </span>
        <span className="adm-alert-count">{pendingTotal}</span>
        <ArrowRight size={20} />
      </Link>

      <div className="adm-flex">
        <div className="adm-card adm-flex-2">
          <h2>Transaksi terbaru</h2>
          <div className="adm-recent-list">
            {recent.length === 0 ? (
              <EmptyState
                compact
                icon={ReceiptText}
                title="Belum ada transaksi"
                description="Transaksi baru akan muncul di sini."
              />
            ) : (
              recent.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/transaksi?sel=${order.id}`}
                  className="adm-tx-row adm-tx-row-flat"
                >
                  <span className="adm-tx-ref">
                    <b>{order.ref}</b>
                    <small>{formatTime(order.created_at)}</small>
                  </span>
                  <span className="adm-tx-product">
                    <b>{order.nama_produk ?? order.nama_layanan}</b>
                    <small>
                      {order.nama_layanan} · {order.nomor_tujuan}
                    </small>
                  </span>
                  <span className="adm-tx-total">
                    <b>{order.total !== null ? formatRupiah(order.total) : "Belum ditetapkan"}</b>
                    <StatusPill status={order.status} />
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="adm-card adm-flex-1 adm-popular-card">
          <h2>Layanan terlaris</h2>
          {summary.layanan_terlaris.length === 0 ? (
            <EmptyState
              compact
              icon={TrendingUp}
              title="Belum ada layanan terlaris"
              description="Data muncul setelah ada transaksi sukses."
            />
          ) : (
            <div className="adm-popular-list">
              {summary.layanan_terlaris.map((item) => (
                <div key={item.nama} className="adm-popular-item">
                  <div className="adm-popular-head">
                    <b>{item.nama}</b>
                    <span>{formatNumber(item.jumlah)} trx</span>
                  </div>
                  <div className="adm-bar">
                    <i
                      style={{
                        width: `${Math.max(5, Math.round((item.jumlah / maxPopular) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="adm-hint adm-dashboard-footnote">
            Diperbarui {formatDateTime(new Date().toISOString())} WIB
          </p>
        </div>
      </div>
    </div>
  );
}
