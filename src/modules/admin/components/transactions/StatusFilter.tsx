import { TRANSACTION_FILTERS } from "../../constants";
import { cn } from "../../lib/utils";
import { txHref } from "../../lib/links";
import type { TransactionFilterKey } from "../../types";
import type { TransactionCounts } from "../../data/transactions";
import { StatusSelect } from "./StatusSelect";

export function StatusFilter({
  counts,
  active,
  q,
}: {
  counts: TransactionCounts;
  active: TransactionFilterKey;
  q: string;
}) {
  return (
    <>
      <div className="adm-seg adm-filter-tabs" role="tablist" aria-label="Filter status">
        {TRANSACTION_FILTERS.map((filter) => {
          const count =
            filter.key === "all" ? counts.all : counts[filter.status!];
          return (
            <a
              key={filter.key}
              href={txHref({ status: filter.key, q })}
              role="tab"
              aria-selected={active === filter.key}
              className={cn("adm-seg-btn", active === filter.key && "is-active")}
            >
              {filter.label}
              <small>{count}</small>
            </a>
          );
        })}
      </div>
      <div className="adm-filter-select-wrap">
        <StatusSelect counts={counts} active={active} q={q} />
      </div>
    </>
  );
}
