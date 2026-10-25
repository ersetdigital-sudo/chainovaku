"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "./Icons";
import { hash, rp } from "@/lib/format";
import {
  ADMIN_WHATSAPP,
  ADMIN_WHATSAPP_DISPLAY,
  QRIS_IMAGE,
  clearOrder,
  loadOrder,
  loadOrders,
  saveOrders,
} from "@/lib/store";
import type { Order, SavedOrder } from "@/lib/store";

type Method = { id: string; n: string; d?: string; fee: number; pct?: number; g: string };

const METHODS: { g: string; list: Omit<Method, "g">[] }[] = [
  {
    g: "QRIS",
    list: [{ id: "qris", n: "QRIS", d: "Semua e-wallet & m-banking", fee: 0, pct: 0.007 }],
  },
  {
    g: "Virtual Account",
    list: [
      { id: "bca", n: "BCA Virtual Account", fee: 4000 },
      { id: "bri", n: "BRI Virtual Account", fee: 3000 },
      { id: "mandiri", n: "Mandiri Virtual Account", fee: 3000 },
      { id: "bni", n: "BNI Virtual Account", fee: 3000 },
    ],
  },
  {
    g: "E-Wallet",
    list: [
      { id: "dana", n: "DANA", fee: 0, pct: 0.015 },
      { id: "ovo", n: "OVO", fee: 0, pct: 0.015 },
      { id: "gopay", n: "GoPay", fee: 0, pct: 0.02 },
      { id: "shopeepay", n: "ShopeePay", fee: 0, pct: 0.015 },
    ],
  },
];

const ALL: Method[] = METHODS.flatMap((g) => g.list.map((m) => ({ ...m, g: g.g })));

const VA_PREFIX: Record<string, string> = {
  bca: "39358",
  bri: "26215",
  mandiri: "89508",
  bni: "98812",
};

const STEPS: [number, string, string][] = [
  [1, "Data pesanan", "Cek rincian"],
  [2, "Pembayaran", "Scan & konfirmasi"],
  [3, "Diproses", "Menunggu verifikasi"],
];

export function CheckoutClient() {
  const [order, setOrder] = useState<Order | null>(null);
  const [ready, setReady] = useState(false);
  const [inv, setInv] = useState("");
  const [method, setMethod] = useState<Method | null>(null);
  const [disc, setDisc] = useState(0);
  const [step, setStep] = useState(1);
  const [contact, setContact] = useState("");
  const [promo, setPromo] = useState("");
  const [promoMsg, setPromoMsg] = useState<{ text: string; tone: "ok" | "err" | "none" }>({
    text: "",
    tone: "none",
  });
  const [left, setLeft] = useState(900);
  const [timedOut, setTimedOut] = useState(false);
  const [copied, setCopied] = useState(false);

  const leftRef = useRef(900);

  useEffect(() => {
    setOrder(loadOrder());
    setInv("CHV" + Date.now().toString().slice(-9));
    setReady(true);
  }, []);

  const fee = useMemo(() => {
    if (!order || !method) return 0;
    return Math.round(method.fee + (method.pct ?? 0) * (order.price + order.admin));
  }, [order, method]);

  const total = order ? order.price + order.admin + fee - disc : 0;

  const saveOrd = useCallback(
    (status: "pending" | "processing" | "success") => {
      if (!order) return;
      const all = loadOrders();
      const i = all.findIndex((x) => x.inv === inv);
      const prev = i >= 0 ? all[i] : undefined;
      const record: SavedOrder = {
        inv,
        status,
        service: order.service,
        product: order.product,
        lines: order.lines,
        method: method?.n ?? "",
        total: order.price + order.admin + fee - disc,
        contact,
        sn: prev?.sn || "",
        label: prev?.label || "",
        created: prev?.created ?? Date.now(),
        updated: Date.now(),
      };
      if (status !== "pending") record.paidAt = Date.now();
      if (i >= 0) all[i] = record;
      else all.unshift(record);
      saveOrders(all);
    },
    [order, inv, method, fee, disc, contact],
  );

  useEffect(() => {
    if (!ready || !order) return;
    setMethod(ALL.find((m) => m.id === "qris") ?? null);
    setStep(2);
  }, [ready, order]);

  useEffect(() => {
    if (step !== 2 || !order) return;
    leftRef.current = 900;
    setLeft(900);
    setTimedOut(false);
    saveOrd("pending");
    const t = setInterval(() => {
      leftRef.current -= 1;
      setLeft(leftRef.current);
      if (leftRef.current <= 0) {
        clearInterval(t);
        setTimedOut(true);
      }
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, order]);

  const summaryRows = useMemo(() => {
    if (!order) return [];
    const rows: [string, string][] = order.lines.map(([k, v]) => [k, v]);
    rows.push(["Harga", rp(order.price)]);
    if (order.admin) rows.push(["Biaya admin", rp(order.admin)]);
    if (method) {
      rows.push([
        `Biaya layanan (${method.n.replace(" Virtual Account", " VA")})`,
        fee ? rp(fee) : "Gratis",
      ]);
    }
    if (disc) rows.push(["Promo CHAINOVA10", `−${rp(disc)}`]);
    return rows;
  }, [order, method, fee, disc]);

  const applyPromo = () => {
    if (!order) return;
    const code = promo.trim().toUpperCase();
    if (code === "CHAINOVA10") {
      if (order.slug === "pln") {
        const d = Math.min(10000, Math.round(order.price * 0.1));
        setDisc(d);
        setPromoMsg({ text: `Promo dipakai, hemat ${rp(d)}.`, tone: "ok" });
      } else {
        setDisc(0);
        setPromoMsg({ text: "Kode ini khusus token PLN.", tone: "err" });
      }
    } else {
      setDisc(0);
      setPromoMsg({
        text: code ? "Kode promo tidak ditemukan." : "Masukkan kode promo dulu.",
        tone: "err",
      });
    }
  };

  const markPaid = () => {
    if (!order) return;
    saveOrd("processing");
    clearOrder();
    setStep(3);
  };

  const vaNumber =
    method && VA_PREFIX[method.id]
      ? VA_PREFIX[method.id] + String(hash(inv)).padStart(10, "0").slice(0, 10)
      : "";

  const copyVa = async () => {
    try {
      await navigator.clipboard?.writeText(vaNumber);
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const receiptRows = useMemo(() => {
    if (!order) return [];
    const rows: [string, string][] = [
      ["No. invoice", inv],
      ["Waktu", new Date().toLocaleString("id-ID")],
      ...order.lines,
      ["Metode", method?.n ?? ""],
      ["Total pembayaran", rp(total)],
    ];
    if (contact.trim()) rows.push(["Kontak", contact.trim()]);
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, inv, method, total, contact]);

  if (!ready) return <div className="h-40" />;

  if (!order) {
    return (
      <div className="card p-8 mt-6 text-center">
        <div className="w-12 h-12 rounded-lg bg-[#FFEF4D] grid place-items-center mx-auto">
          <Icon name="card" size={22} stroke="#1D2650" />
        </div>
        <h2 className="text-lg font-bold mt-4">Belum ada pesanan</h2>
        <p className="text-sm text-[#5C6480] mt-1.5">Pilih layanan dulu, lalu kembali ke halaman ini.</p>
        <Link href="/#layanan" className="btn inline-block mt-5">
          Lihat layanan
        </Link>
      </div>
    );
  }

  const howto = (() => {
    if (!method) return [];
    if (method.id === "qris") {
      return [
        "Buka aplikasi m-banking atau e-wallet.",
        "Pilih menu Scan / Bayar QRIS.",
        "Scan kode di atas, pastikan nominal sesuai.",
        "Setelah bayar, tekan tombol Saya sudah bayar.",
      ];
    }
    if (method.g === "Virtual Account") {
      return [
        `Buka m-banking atau ATM ${method.n.split(" ")[0]}.`,
        "Pilih Transfer, lalu Virtual Account.",
        "Masukkan nomor VA di atas dan konfirmasi.",
        "Tekan tombol Saya sudah bayar setelah transfer.",
      ];
    }
    return [
      `Buka aplikasi ${method.n}.`,
      "Cek notifikasi pembayaran dari Chainovaku.",
      "Konfirmasi dengan PIN kamu.",
      "Tekan tombol Saya sudah bayar setelah selesai.",
    ];
  })();

  return (
    <>
      {/* mobile compact steps */}
      <ol className="lg:hidden mt-5 grid grid-cols-3 gap-2">
        {STEPS.map(([n, label]) => (
          <li key={n}>
            <div className={`h-1 rounded-sm ${step >= n ? "bg-[#2A428C]" : "bg-[#DDE2F0]"}`} />
            <div
              className={`mt-1.5 text-[10px] font-bold uppercase tracking-wider ${
                step >= n ? "text-[#2A428C]" : "text-[#9AA1BA]"
              }`}
            >
              {label}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-5 lg:mt-6 lg:grid lg:grid-cols-[170px_1fr_300px] lg:gap-5 xl:gap-6 lg:items-start">
        {/* desktop vertical stepper */}
        <aside className="hidden lg:block lg:sticky lg:top-24">
          <ol>
            {STEPS.map(([n, label, sub], i) => {
              const active = step === n;
              const done = step > n;
              return (
                <li key={n} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={`w-8 h-8 rounded-md grid place-items-center text-xs font-bold border ${
                        active
                          ? "bg-[#2A428C] border-[#2A428C] text-[#FFEF4D]"
                          : done
                            ? "bg-[#FFEF4D] border-[#E8D83F] text-[#1D2650]"
                            : "bg-white border-[#DDE2F0] text-[#9AA1BA]"
                      }`}
                    >
                      {n}
                    </span>
                    {i < STEPS.length - 1 && (
                      <span className={`w-px min-h-[52px] ${done ? "bg-[#2A428C]" : "bg-[#DDE2F0]"}`} />
                    )}
                  </div>
                  <div className="pt-1">
                    <div className={`text-sm font-bold ${active ? "text-[#1D2650]" : "text-[#5C6480]"}`}>
                      {label}
                    </div>
                    <div className="text-[11px] text-[#9AA1BA] mt-0.5">{sub}</div>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-4 rounded-lg border border-dashed border-[#C9D0E6] bg-white p-3">
            <div className="kicker text-[#9AA1BA]">Invoice</div>
            <div className="font-mono text-xs font-bold mt-1 break-all">{inv}</div>
          </div>
        </aside>

        {/* main */}
        <div>
          {step === 1 && (
            <section className="card p-5 md:p-6">
              <div className="kicker text-[#2A428C]">Metode bayar</div>
              <h2 className="text-lg font-bold mt-1">Pilih metode pembayaran</h2>

              <div className="mt-5 space-y-4">
                {METHODS.map((group) => (
                  <div key={group.g}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#5C6480] mb-2">
                      {group.g}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {group.list.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setMethod({ ...m, g: group.g })}
                          className={`opt flex justify-between items-center gap-3 ${
                            method?.id === m.id ? "on" : ""
                          }`}
                        >
                          <span>
                            <span className="font-semibold block text-sm">{m.n}</span>
                            {m.d && <span className="text-[11px] text-[#5C6480]">{m.d}</span>}
                          </span>
                          <span className="text-[10px] font-bold text-[#5C6480] whitespace-nowrap">
                            {m.pct
                              ? `+${(m.pct * 100).toFixed(1).replace(".0", "")}%`
                              : `+${rp(m.fee)}`}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <label className="text-xs font-bold uppercase tracking-wider text-[#5C6480]">
                  Kirim bukti ke (opsional)
                </label>
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="inp mt-2"
                  placeholder="Email atau nomor WhatsApp"
                />
              </div>

              <div className="mt-5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#5C6480]">Kode promo</label>
                <div className="mt-2 flex gap-2">
                  <input
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    className="inp uppercase"
                    placeholder="CHAINOVA10"
                  />
                  <button
                    type="button"
                    onClick={applyPromo}
                    className="shrink-0 rounded-lg border border-[#E1E5F2] bg-white px-4 text-sm font-bold hover:border-[#2A428C]"
                  >
                    Pakai
                  </button>
                </div>
                <p
                  className={`text-xs mt-2 ${
                    promoMsg.tone === "ok"
                      ? "text-[#166534] font-semibold"
                      : promoMsg.tone === "err"
                        ? "text-[#C81E3C]"
                        : ""
                  }`}
                >
                  {promoMsg.text}
                </p>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="card p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="kicker text-[#5C6480]">Selesaikan dalam</div>
                  <div className="disp text-2xl font-bold mt-1">
                    {timedOut
                      ? "Waktu habis"
                      : `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="kicker text-[#5C6480]">Invoice</div>
                  <div className="font-mono text-xs font-bold mt-1">{inv}</div>
                </div>
              </div>

              <div className="mt-5">
                {method?.id === "qris" && (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-[#1D2650] px-2 py-1 text-[10px] font-extrabold text-[#FFEF4D]">
                        QRIS
                      </span>
                      <span className="text-xs text-[#5C6480]">Scan pakai e-wallet / m-banking apa aja</span>
                    </div>
                    <div className="mt-3 rounded-xl border border-[#E1E5F2] bg-[#F7F8FD] p-3">
                      <div className="mx-auto w-full max-w-[300px] rounded-lg border border-[#E1E5F2] bg-white p-2.5">
                        <img
                          src={QRIS_IMAGE}
                          alt="Kode QRIS Chainovaku"
                          width={640}
                          height={640}
                          loading="eager"
                          className="block w-full h-auto rounded"
                        />
                      </div>
                      <div className="mt-3 flex items-end justify-between gap-3">
                        <div>
                          <div className="kicker text-[#5C6480]">Total bayar</div>
                          <div className="disp text-xl font-bold mt-0.5">{rp(total)}</div>
                        </div>
                        <div className="text-[11px] text-[#5C6480] text-right">a.n. Chainovaku</div>
                      </div>
                    </div>
                  </div>
                )}

                {method?.g === "Virtual Account" && (
                  <div className="rounded-xl border border-[#E1E5F2] p-4">
                    <div className="kicker text-[#5C6480]">Nomor {method.n}</div>
                    <div className="flex items-center justify-between gap-3 mt-2">
                      <span className="font-mono text-lg md:text-xl font-bold tracking-wider">
                        {vaNumber.replace(/(\d{4})/g, "$1 ").trim()}
                      </span>
                      <button
                        type="button"
                        onClick={copyVa}
                        className="text-xs font-bold text-[#2A428C]"
                      >
                        {copied ? "Tersalin" : "Salin"}
                      </button>
                    </div>
                    <div className="mt-4 text-xs text-[#5C6480]">Jumlah transfer</div>
                    <div className="disp text-xl font-bold mt-0.5">{rp(total)}</div>
                  </div>
                )}

                {method && method.g === "E-Wallet" && (
                  <div className="rounded-xl border border-[#E1E5F2] p-5 text-center">
                    <div className="text-xs text-[#5C6480]">Tagihan dikirim ke aplikasi {method.n}</div>
                    <div className="disp text-xl font-bold mt-2">{rp(total)}</div>
                    <a href="#" onClick={(e) => e.preventDefault()} className="btn inline-block mt-4">
                      Buka {method.n}
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-5 rounded-lg bg-[#F7F8FD] border border-[#E1E5F2] p-4">
                <div className="kicker text-[#5C6480]">Cara bayar</div>
                <ol className="mt-2 space-y-1.5 text-xs text-[#4A5375] list-decimal pl-4">
                  {howto.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ol>
              </div>

              <button type="button" onClick={markPaid} disabled={timedOut} className="btn-lemon w-full mt-5 min-h-[48px]">
                Saya sudah bayar
              </button>

              <p className="mt-3 text-center text-xs text-[#5C6480]">
                Ada kendala? Hubungi admin WhatsApp{" "}
                <a
                  href={ADMIN_WHATSAPP}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-[#2A428C] hover:underline"
                >
                  {ADMIN_WHATSAPP_DISPLAY}
                </a>
              </p>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full mt-2 text-xs font-bold text-[#5C6480] hover:text-[#1D2650]"
              >
                Ganti metode pembayaran
              </button>
            </section>
          )}

          {step === 3 && (
            <section className="card overflow-hidden">
              <div className="bg-[#FFEF4D] border-b border-[#E8D83F] p-5 md:p-6">
                <div className="flex items-start gap-4">
                  <span className="w-11 h-11 shrink-0 rounded-lg bg-[#2A428C] grid place-items-center">
                    <Icon name="spinner" size={22} stroke="#FFEF4D" className="spin" />
                  </span>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold leading-tight">
                      Terima kasih, pembayaran Anda sedang diproses
                    </h2>
                    <p className="text-sm text-[#3B456B] mt-1.5">
                      Admin akan memverifikasi pembayaran dan memproses pesananmu.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="kicker text-[#5C6480]">Invoice</div>
                    <div className="font-mono text-sm font-bold mt-1">{inv}</div>
                  </div>
                  <span className="stamp px-2.5 py-1 text-[10px]">Diproses</span>
                </div>

                <div className="mt-5 pt-5 dashed-top space-y-2.5 text-sm">
                  {receiptRows.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <span className="text-[#5C6480]">{k}</span>
                      <b className="text-right">{v}</b>
                    </div>
                  ))}
                </div>

                <Link
                  href={`/cek-pesanan/?inv=${inv}`}
                  className="btn-lemon w-full mt-5 inline-flex items-center justify-center min-h-[46px]"
                >
                  Lacak pesanan →
                </Link>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link href="/#layanan" className="btn text-center text-sm">
                    Beli lagi
                  </Link>
                  <a
                    href={ADMIN_WHATSAPP}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-[#E1E5F2] bg-white text-center text-sm font-bold py-3 hover:border-[#2A428C]"
                  >
                    Hubungi admin
                  </a>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* summary */}
        {step !== 3 && (
          <aside className="card p-5 mt-5 lg:mt-0 lg:sticky lg:top-24">
            <div className="kicker text-[#2A428C]">Ringkasan</div>
            <div className="mt-3 space-y-2.5 text-sm">
              {summaryRows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <span className="text-[#5C6480]">{k}</span>
                  <b className={`text-right ${k.startsWith("Promo") ? "text-[#166534]" : ""}`}>{v}</b>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-dashed border-[#C9D0E6] flex justify-between items-baseline">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5C6480]">Total</span>
              <span className="disp text-xl font-bold">{rp(total)}</span>
            </div>
            {step === 1 && (
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!method}
                className="btn-lemon w-full mt-4 min-h-[46px]"
              >
                Lanjut bayar →
              </button>
            )}
            <p className="text-[11px] text-[#5C6480] mt-2.5 text-center">
              Dana kembali otomatis kalau transaksi gagal.
            </p>
          </aside>
        )}
      </div>
    </>
  );
}
