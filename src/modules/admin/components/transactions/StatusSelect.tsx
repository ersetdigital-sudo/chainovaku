"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { TRANSACTION_FILTERS } from "../../constants";
import { Loader2 } from "../../icons";
import { txHref } from "../../lib/links";
import type { TransactionFilterKey } from "../../types";
import type { TransactionCounts } from "../../data/transactions";

export function StatusSelect({
  counts,
  active,
  q,
}: {
  counts: TransactionCounts;
  active: TransactionFilterKey;
  q: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <span className="adm-select-loading">
      <select
        className="adm-select"
        aria-label="Filter status transaksi"
        value={active}
        onChange={(event) => {
          const value = event.target.value as TransactionFilterKey;
          startTransition(() => {
            router.push(txHref({ status: value, q }), { scroll: false });
          });
        }}
      >
        {TRANSACTION_FILTERS.map((filter) => {
          const count =
            filter.key === "all" ? counts.all : counts[filter.status!];
          return (
            <option key={filter.key} value={filter.key}>
              {filter.label} ({count})
            </option>
          );
        })}
      </select>
      {pending ? <Loader2 size={16} className="adm-spin" /> : null}
    </span>
  );
}
