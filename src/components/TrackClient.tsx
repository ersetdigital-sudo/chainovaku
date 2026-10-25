"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "./Icons";
import { rp } from "@/lib/format";
import { ADMIN_WHATSAPP, ADMIN_WHATSAPP_DISPLAY, loadOrders } from "@/lib/store";
import type { SavedOrder } from "@/lib/store";

type Status = "success" | "processing" | "pending" | "expired";

const STEPS: [string, keyof SavedOrder | "paidAt"][] = [
  ["Pesanan dibuat", "created"],
  ["Menunggu pembayaran", "created"],
  ["Pembayaran diterima", "paidAt"],
  ["Diproses ke provider", "paidAt"],
  ["Selesai", "paidAt"],
];

const BADGES: Record<Status, [string, string]> = {
  success: ["Berhasil", "bg-[#DCFCE7] text-[#166534] border-[#BBE8C6]"],
  processing: ["Sedang diproses", "bg-[#FFEF4D] text-[#1D2650] border-[#E8D83F]"],
  pending: ["Menunggu pembayaran", "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]"],
  expired: ["Kedaluwarsa", "bg-[#FFE4E6] text-[#C81E3C] border-[#FECDD3]"],
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
  const [found, setFound] = useState<SavedOrder | null>(null);
  const [missing, setMissing] = useState(false);
  const [recent, setRecent] = useState<SavedOrder[]>([]);

  useEffect(() => {
    const orders = loadOrders();
    setRecent(orders.slice(0, 4));
    const q = searchParams.get("inv");
    if (q) {
      setInv(q);
      show(q, orders);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function show(value: string, source?: SavedOrder[]) {
    const code = (value || "").trim().toUpperCase();
    if (!code) {
      setFound(null);
      setMissing(false);
      return;
    }
    const orders = source ?? loadOrders();
    const record = orders.find((x) => x.inv === code);
    if (!record) {
      setFound(null);
      setMissing(true);
      return;
    }
    setFound(record);
    setMissing(false);
    if (searchParams.get("inv") !== code) {
      router.replace(`/cek-pesanan/?inv=${code}`, { scroll: false });
    }
  }

  const status: Status | null = found
    ? found.status === "success"
      ? "success"
      : found.status === "processing"
        ? "processing"
        : Date.now() - found.created > 900000
          ? "expired"
          : "pending"
    : null;

  return (
    <>
      <div className="card p-1.5 mt-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            show(inv);
          }}
          className="flex flex-col sm:flex-row gap-1.5"
        >
          <input
            value={inv}
            onChange={(e) => setInv(e.target.value)}
            className="inp border-0 bg-transparent flex-1 font-mono uppercase focus:shadow-none"
            placeholder="Masukkan nomor invoice, contoh CHV123456789"
            autoComplete="off"
            required
          />
          <button type="submit" className="btn shrink-0 min-h-[46px]">
            Lacak resi
          </button>
        </form>
      </div>

      {recent.length > 0 && (
        <div className="mt-4">
          <div className="kicker text-[#5C6480] mb-2">Pesanan terakhir di perangkat ini</div>
          <div className="flex flex-wrap gap-2">
            {recent.map((r) => (
              <button
                key={r.inv}
                type="button"
                onClick={() => {
                  setInv(r.inv);
                  show(r.inv);
                }}
                className="rounded-md border border-[#E1E5F2] bg-white px-2.5 py-1.5 text-xs font-semibold hover:border-[#2A428C]"
              >
                <span className="font-mono">{r.inv}</span> · {r.service}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5">
        {missing && (
          <div className="card p-8 text-center">
            <div className="w-11 h-11 rounded-lg bg-[#FFEF4D] grid place-items-center mx-auto">
              <Icon name="card" size={20} stroke="#1D2650" />
            </div>
            <h2 className="text-lg font-bold mt-3">Resi tidak ditemukan</h2>
            <p className="text-sm text-[#5C6480] mt-1.5 max-w-sm mx-auto">
              Cek lagi nomor invoice kamu. Nomor tercantum di halaman pembayaran dan bukti transaksi.
            </p>
          </div>
        )}

        {found && status && (
          <div className="card overflow-hidden">
            {/* resi header */}
            <div className="bg-[#EEF1FB] border-b border-[#D9DEF0] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="kicker text-[#2A428C]">Resi digital · Chainovaku</div>
                  <div className="font-mono text-xl md:text-2xl font-bold mt-1.5">{found.inv}</div>
                  <div className="text-xs text-[#5C6480] mt-1">Dibuat {dt(found.created)}</div>
                </div>
                <span className={`stamp bg-white px-2.5 py-1 text-[10px] ${BADGES[status][1]}`}>
                  {BADGES[status][0]}
                </span>
              </div>
            </div>

            <div className="p-5 md:p-6">
              {/* vertical timeline */}
              <ol className="space-y-0">
                {STEPS.map(([title, key], i) => {
                  const ok =
                    status === "success" || (status === "processing" ? i < 4 : key !== "paidAt");
                  const time = found[key] as number | undefined;
                  const nextOk =
                    i < STEPS.length - 1
                      ? status === "success" ||
                        (status === "processing" ? i + 1 < 4 : STEPS[i + 1][1] !== "paidAt")
                      : false;
                  return (
                    <li key={title} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className={`w-6 h-6 rounded-md grid place-items-center text-[10px] font-bold border ${
                            ok
                              ? "bg-[#2A428C] border-[#2A428C] text-[#FFEF4D]"
                              : "bg-white border-[#DDE2F0] text-[#9AA1BA]"
                          }`}
                        >
                          {ok ? "✓" : i + 1}
                        </span>
                        {i < STEPS.length - 1 && (
                          <span className={`w-px flex-1 min-h-[26px] ${ok && nextOk ? "bg-[#2A428C]" : "bg-[#DDE2F0]"}`} />
                        )}
                      </div>
                      <div className="pb-4">
                        <div className={`text-sm font-semibold ${ok ? "" : "text-[#9AA1BA]"}`}>{title}</div>
                        {ok && time ? <div className="text-[11px] text-[#5C6480] mt-0.5">{dt(time)}</div> : null}
                      </div>
                    </li>
                  );
                })}
              </ol>

              <div className="pt-4 dashed-top space-y-2.5 text-sm">
                {found.lines.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <span className="text-[#5C6480]">{k}</span>
                    <b className="text-right">{v}</b>
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
                <div className="mt-5 rounded-lg bg-[#FFEF4D] border border-[#E8D83F] p-3.5">
                  <div className="text-xs font-bold text-[#1D2650]">Pembayaran sedang diverifikasi</div>
                  <p className="text-xs text-[#3B456B] mt-1">
                    Terima kasih. Admin sedang memproses pesananmu. Simpan nomor invoice ini.
                  </p>
                </div>
              )}

              {status === "pending" && (
                <p className="mt-5 text-xs text-[#5C6480]">
                  Belum bayar? Selesaikan sebelum {dt(found.created + 900000)}.
                </p>
              )}

              {status === "expired" && (
                <Link href="/#layanan" className="btn inline-block mt-5">
                  Pesan ulang
                </Link>
              )}

              <div className="mt-5 pt-4 border-t border-[#E1E5F2] flex flex-wrap gap-3 items-center justify-between">
                <span className="text-xs text-[#5C6480]">
                  Butuh bantuan?{" "}
                  <a
                    href={ADMIN_WHATSAPP}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-[#2A428C] hover:underline"
                  >
                    WhatsApp {ADMIN_WHATSAPP_DISPLAY}
                  </a>
                </span>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-md border border-[#E1E5F2] bg-white px-3 py-2 text-xs font-bold hover:border-[#2A428C]"
                >
                  Simpan resi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
