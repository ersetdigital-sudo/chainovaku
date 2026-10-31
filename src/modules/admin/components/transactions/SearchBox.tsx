"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2, Search, X } from "../../icons";
import { txHref } from "../../lib/links";

export function SearchBox({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialQuery);
  const [pending, startTransition] = useTransition();
  const currentQuery = searchParams?.get("q") ?? "";
  const lastPushed = useRef(initialQuery);

  const submit = (nextValue: string) => {
    if (nextValue === lastPushed.current) return;
    lastPushed.current = nextValue;
    const status = searchParams?.get("status") ?? "all";
    const href = pathname.includes("/transaksi")
      ? txHref({ status, q: nextValue })
      : pathname;
    startTransition(() => router.push(href, { scroll: false }));
  };

  useEffect(() => {
    if (value === currentQuery) return;
    const timer = window.setTimeout(() => submit(value), 420);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, currentQuery]);

  return (
    <form
      className="adm-search"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        submit(value.trim());
      }}
    >
      <Search size={19} />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Cari referensi atau nomor tujuan"
        aria-label="Cari transaksi"
      />
      {pending ? <Loader2 size={17} className="adm-spin" /> : null}
      {value ? (
        <button
          type="button"
          className="adm-search-clear"
          onClick={() => {
            setValue("");
            submit("");
          }}
          aria-label="Hapus pencarian"
        >
          <X size={16} />
        </button>
      ) : null}
    </form>
  );
}
