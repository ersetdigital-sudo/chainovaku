import { txHref } from "../../lib/links";

export function Pagination({
  page,
  pageCount,
  status,
  q,
}: {
  page: number;
  pageCount: number;
  status: string;
  q: string;
}) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1)
    .filter(
      (item) =>
        item === 1 ||
        item === pageCount ||
        Math.abs(item - page) <= 1,
    )
    .reduce<(number | "gap")[]>((result, item, index, list) => {
      if (index > 0 && item - (list[index - 1] as number) > 1) {
        result.push("gap");
      }
      result.push(item);
      return result;
    }, []);

  return (
    <nav className="adm-pagination" aria-label="Halaman transaksi">
      <a
        href={txHref({ status, q, page: Math.max(1, page - 1) })}
        className="adm-page-btn"
        aria-disabled={page <= 1}
      >
        Sebelumnya
      </a>
      <div className="adm-page-numbers">
        {pages.map((item, index) =>
          item === "gap" ? (
            <span key={`gap-${index}`} className="adm-page-gap">
              …
            </span>
          ) : (
            <a
              key={item}
              href={txHref({ status, q, page: item })}
              className={`adm-page-btn adm-page-num ${item === page ? "is-active" : ""}`}
              aria-current={item === page ? "page" : undefined}
            >
              {item}
            </a>
          ),
        )}
      </div>
      <a
        href={txHref({ status, q, page: Math.min(pageCount, page + 1) })}
        className="adm-page-btn"
        aria-disabled={page >= pageCount}
      >
        Berikutnya
      </a>
    </nav>
  );
}
