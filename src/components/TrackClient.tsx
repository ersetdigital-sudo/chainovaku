"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { rp } from "@/lib/format";

type Status = "success" | "processing" | "pending" | "expired";

type RemoteOrder = {
  inv: string;
  status: Status;
  service: string;
  product: string;
  lines: [string, string][];
  method: string;
  total: number;
  contact: string;
  sn: string;
  label: string;
  created: number;
  updated: number;
  paidAt?: number;
};

const STEPS: [string, "created" | "paidAt"][] = [
  ["Pesanan dibuat", "created"],
  ["Menunggu pembayaran", "created"],
  ["Pembayaran diterima", "paidAt"],
  ["Diproses ke provider", "paidAt"],
  ["Selesai", "paidAt"],
];

const BADGES: Record<Status, [string, string]> = {
  success: ["Berhasil", "bg-[#DCFCE7] text-[#16A34A]"],
  processing: ["Sedang diproses", "bg-[#FFEF4D] text-[#1D2650]"],
  pending: ["Menunggu pembayaran", "bg-[#FEF3C7] text-[#B45309]"],
  expired: ["Dibatalkan / kedaluwarsa", "bg-[#FFE4E6] text-[#E11D48]"],
};

const dt = (t: number) =>
  new Date(t).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export function TrackClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [inv, setInv] = useState("");
  const [found, setFound] = useState<RemoteOrder | null>(null);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const show = useCallback(
    async (value: string, updateUrl = true) => {
      const code = (value || "").trim().toUpperCase();
      setError("");
      if (!code) {
        setFound(null);
        setMissing(false);
        return;
      }
      if (!/^CNV-[A-Z0-9-]{4,}$/.test(code)) {
        setFound(null);
        setMissing(false);
        setError("Format invoice belum tepat. Contoh: CNV-YYMMDD-XXXXXX.");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(code)}`, {
          headers: { accept: "application/json" },
        });
        if (!response.ok) {
          setFound(null);
          setMissing(true);
          return;
        }
        setFound((await response.json()) as RemoteOrder);
        setMissing(false);
        if (updateUrl) router.replace(`/cek-pesanan/?inv=${code}`, { scroll: false });
      } catch {
        setFound(null);
        setError("Gagal memeriksa pesanan. Coba lagi sebentar.");
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    const q = searchParams.get("inv");
    if (q) {
      setInv(q);
      void show(q, false);
    }
  }, [searchParams, show]);

  const status = found?.status ?? null;

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void show(inv);
        }}
        className="card p-4 mt-6 flex flex-col sm:flex-row gap-3"
      >
        <input
          value={inv}
          onChange={(event) => {
            setInv(event.target.value.toUpperCase());
            if (error) setError("");
          }}
          className="inp text-lg font-mono uppercase flex-1"
          placeholder="CNV-YYMMDD-XXXXXX"
          autoComplete="off"
        />
        <button type="submit" disabled={loading} className="btn disabled:opacity-60">
          {loading ? "Mencari…" : "Lacak"}
        </button>
      </form>

      {error ? <p className="mt-3 text-sm font-semibold text-[#E11D48]">{error}</p> : null}

      <div className="mt-6">
        {missing && (
          <div className="card p-8 text-center">
            <h2 className="text-xl font-bold">Pesanan tidak ditemukan</h2>
            <p className="text-[#5C6480] mt-2">
              Cek lagi nomor invoice kamu (contoh: CNV-YYMMDD-XXXXXX). Nomor ada di halaman
              pembayaran & bukti transaksi.
            </p>
            <Link href="/#layanan" className="btn inline-block mt-6">
              Mulai pesanan baru
            </Link>
          </div>
        )}

        {found && status && (
          <div className="card p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm text-[#5C6480]">No. invoice</div>
                <div className="font-mono text-xl font-bold">{found.inv}</div>
              </div>
              <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${BADGES[status][1]}`}>
                {BADGES[status][0]}
              </span>
            </div>

            <ol className="mt-8 space-y-0">
              {STEPS.map(([title, key], index) => {
                const done =
                  status === "success" ||
                  (status === "processing" ? index < 4 : key !== "paidAt");
                const time = found[key] as number | undefined;
                return (
                  <li key={title} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={`w-7 h-7 rounded-full grid place-items-center text-xs font-bold ${
                          done
                            ? "bg-[#2A428C] text-white"
                            : "bg-white border border-[#E1E5F2] text-[#5C6480]"
                        }`}
                      >
                        {done ? "✓" : index + 1}
                      </span>
                      {index < STEPS.length - 1 && (
                        <span className={`w-px flex-1 min-h-[28px] ${done ? "bg-[#2A428C]" : "bg-[#E1E5F2]"}`} />
                      )}
                    </div>
                    <div className="pb-5">
                      <div className={`font-semibold ${done ? "" : "text-[#5C6480]"}`}>{title}</div>
                      {done && time ? <div className="text-xs text-[#5C6480]">{dt(time)}</div> : null}
                    </div>
                  </li>
                );
              })}
            </ol>

            {found.sn ? (
              <div className="rounded-2xl bg-[#F6F5FB] p-5 text-center">
                <div className="text-sm text-[#5C6480]">{found.label}</div>
                <div className="font-mono text-xl font-bold mt-1 tracking-wider break-all">{found.sn}</div>
              </div>
            ) : null}

            <div className="mt-6 space-y-2 text-sm">
              {found.lines.map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4">
                  <span className="text-[#5C6480]">{key}</span>
                  <b className="text-right break-all">{value}</b>
                </div>
              ))}
              <div className="flex justify-between gap-4">
                <span className="text-[#5C6480]">Metode</span>
                <b className="text-right">{found.method}</b>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#5C6480]">Total</span>
                <b className="text-right">{rp(found.total)}</b>
              </div>
            </div>

            {status === "processing" && (
              <p className="mt-6 rounded-2xl bg-[#F6F5FB] p-4 text-sm text-[#5C6480]">
                Pembayaran sudah dikonfirmasi. Admin sedang memverifikasi sebelum pesanan diproses.
              </p>
            )}
            {status === "pending" && (
              <p className="mt-6 text-sm text-[#5C6480]">
                Pesanan menunggu pembayaran. Selesaikan sebelum waktu habis, lalu konfirmasi ke admin.
              </p>
            )}
            {status === "expired" && (
              <Link href="/#layanan" className="btn inline-block mt-6">
                Pesan ulang
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}
