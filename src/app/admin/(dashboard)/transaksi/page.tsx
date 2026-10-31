import type { Metadata } from "next";
import { Suspense } from "react";
import { Download, ReceiptText } from "@/modules/admin/icons";
import { PageHero } from "@/modules/admin/components/ui/PageHero";
import { EmptyState } from "@/modules/admin/components/ui/EmptyState";
import { StatusFilter } from "@/modules/admin/components/transactions/StatusFilter";
import { SearchBox } from "@/modules/admin/components/transactions/SearchBox";
import { TransactionList } from "@/modules/admin/components/transactions/TransactionList";
import { Pagination } from "@/modules/admin/components/transactions/Pagination";
import { TransactionDetail } from "@/modules/admin/components/transactions/TransactionDetail";
import { requireAdmin } from "@/modules/admin/data/auth";
import {
  getTransactionCounts,
  getTransactionDetail,
  getTransactionList,
} from "@/modules/admin/data/transactions";
import {
  FILTER_STATUS,
  PAGE_SIZE,
  isTransactionFilterKey,
} from "@/modules/admin/constants";
import { exportHref } from "@/modules/admin/lib/links";

export const metadata: Metadata = { title: "Transaksi" };

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    q?: string;
    page?: string;
    sel?: string;
  }>;
}) {
  const params = await searchParams;
  const filterKey = isTransactionFilterKey(params.status)
    ? params.status
    : "all";
  const status = FILTER_STATUS[filterKey];
  const q = typeof params.q === "string" ? params.q.slice(0, 60) : "";
  const requestedPage = Number(params.page ?? "1");
  const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;

  const { brand, supabase } = await requireAdmin();
  const [counts, list] = await Promise.all([
    getTransactionCounts(supabase, brand.id),
    getTransactionList(supabase, brand.id, { status, q, page }),
  ]);

  const selectedId =
    typeof params.sel === "string" && params.sel
      ? params.sel
      : list.orders[0]?.id ?? null;
  const detail = selectedId
    ? await getTransactionDetail(supabase, brand.id, selectedId)
    : null;

  return (
    <div className="adm-page">
      <PageHero
        icon={ReceiptText}
        title="Transaksi"
        subtitle="Bukti bayar dicek di WA, status diubah di sini"
        actions={
          <a
            href={exportHref({ status: filterKey, q })}
            className="adm-btn adm-btn-out"
          >
            <Download size={18} />
            Export Excel
          </a>
        }
      >
        <div className="adm-tx-toolbar">
          <StatusFilter counts={counts} active={filterKey} q={q} />
          <Suspense fallback={<div className="adm-search adm-search-skeleton" />}>
            <SearchBox initialQuery={q} />
          </Suspense>
        </div>
      </PageHero>

      <div className="adm-flex adm-tx-layout">
        <section className="adm-card adm-tx-list-card">
          <TransactionList
            orders={list.orders}
            selectedId={selectedId}
            filter={filterKey}
            q={q}
            page={list.page}
          />
          <div className="adm-tx-list-foot">
            <span className="adm-hint">
              {list.total > 0
                ? `Menampilkan ${(list.page - 1) * PAGE_SIZE + 1}–${Math.min(
                    list.page * PAGE_SIZE,
                    list.total,
                  )} dari ${list.total} transaksi`
                : "0 transaksi"}
            </span>
            <Pagination
              page={list.page}
              pageCount={list.pageCount}
              status={filterKey}
              q={q}
            />
          </div>
        </section>

        <aside className="adm-card adm-tx-detail" aria-label="Detail transaksi">
          {detail ? (
            <TransactionDetail
              key={detail.order.id}
              brand={brand}
              order={detail.order}
              service={detail.service}
              voucher={detail.voucher}
              logs={detail.logs}
            />
          ) : (
            <EmptyState
              icon={ReceiptText}
              title="Pilih transaksi"
              description="Klik salah satu transaksi untuk melihat detail dan memprosesnya."
            />
          )}
        </aside>
      </div>
    </div>
  );
}
