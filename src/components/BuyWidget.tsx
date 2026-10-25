"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GAMES, gameNames } from "@/lib/games";
import { operator, rp } from "@/lib/format";
import { saveOrder } from "@/lib/store";
import type { OrderLine } from "@/lib/store";
import { TAB_EVENT } from "./TabLink";

type TabKey = "pulsa" | "data" | "pln" | "game" | "ewallet" | "tagihan";

const TABS: { key: TabKey; label: string }[] = [
  { key: "pulsa", label: "Pulsa" },
  { key: "data", label: "Data" },
  { key: "pln", label: "PLN" },
  { key: "game", label: "Game" },
  { key: "ewallet", label: "E-Wallet" },
  { key: "tagihan", label: "Tagihan" },
];

type Product = { l: string; ph: string; n: [string, number][] };

const P: Record<TabKey, Product> = {
  pulsa: {
    l: "Nomor HP",
    ph: "08xx xxxx xxxx",
    n: [
      ["5rb", 6500],
      ["10rb", 11000],
      ["20rb", 20800],
      ["25rb", 25800],
      ["50rb", 50300],
      ["100rb", 99500],
    ],
  },
  data: {
    l: "Nomor HP",
    ph: "08xx xxxx xxxx",
    n: [
      ["2GB", 12000],
      ["5GB", 25000],
      ["10GB", 45000],
      ["15GB", 60000],
      ["25GB", 85000],
      ["50GB", 130000],
    ],
  },
  pln: {
    l: "Nomor meter / ID pelanggan",
    ph: "Contoh: 5123 4567 8901",
    n: [
      ["20rb", 20800],
      ["50rb", 50300],
      ["100rb", 100300],
      ["200rb", 200300],
      ["500rb", 500300],
      ["1jt", 1000300],
    ],
  },
  ewallet: {
    l: "Nomor e-wallet",
    ph: "08xx xxxx xxxx",
    n: [
      ["10rb", 11000],
      ["25rb", 26000],
      ["50rb", 51000],
      ["100rb", 101000],
      ["200rb", 201000],
      ["500rb", 501000],
    ],
  },
  game: { l: "User ID", ph: "Masukkan User ID", n: [] },
  tagihan: {
    l: "ID pelanggan",
    ph: "BPJS / PDAM / internet",
    n: [
      ["BPJS", 2500],
      ["PDAM", 2500],
      ["TV & Internet", 2500],
      ["Multifinance", 3500],
    ],
  },
};

const SERVICE_NAME: Record<TabKey, string> = {
  pulsa: "Pulsa",
  data: "Paket Data",
  pln: "Token PLN",
  game: "",
  ewallet: "E-Wallet",
  tagihan: "Tagihan",
};

const SERVICE_SLUG: Record<TabKey, string> = {
  pulsa: "pulsa",
  data: "paket-data",
  pln: "pln",
  game: "top-up-game",
  ewallet: "e-wallet",
  tagihan: "pdam",
};

const digits = (v: string) => v.replace(/\D/g, "");

export function BuyWidget() {
  const router = useRouter();

  const [tab, setTab] = useState<TabKey>("pulsa");
  const [game, setGame] = useState(gameNames[0]);
  const [sel, setSel] = useState<number | null>(null);
  const [num, setNum] = useState("");
  const [zone, setZone] = useState("");

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("tab");
    if (fromUrl && fromUrl in P) setTab(fromUrl as TabKey);

    const onTab = (e: Event) => {
      const next = (e as CustomEvent<string>).detail;
      if (next && next in P) setTab(next as TabKey);
    };
    window.addEventListener(TAB_EVENT, onTab);
    return () => window.removeEventListener(TAB_EVENT, onTab);
  }, []);

  useEffect(() => {
    setSel(null);
  }, [tab, game]);

  const products: [string, number][] = tab === "game" ? GAMES[game].chips.map(([a, , p]) => [a, p]) : P[tab].n;

  const op = tab === "pulsa" || tab === "data" || tab === "ewallet" ? operator(num) : "";
  const selected = sel !== null ? products[sel] : null;
  const price = selected ? selected[1] : 0;
  const zoneVisible = tab === "game" && GAMES[game].zone;
  const canPay = price > 0 && digits(num).length >= (tab === "game" ? 5 : 8);

  const selectTab = useCallback((key: TabKey) => {
    setTab(key);
    window.history.replaceState(null, "", `/?tab=${key}`);
  }, []);

  const handlePay = () => {
    if (!canPay || !selected) return;
    const service = tab === "game" ? game : SERVICE_NAME[tab];
    const lines: OrderLine[] = [
      ["Layanan", service],
      [P[tab].l, num + (op ? ` · ${op}` : "")],
      ["Produk", selected[0]],
    ];
    if (zoneVisible && zone) lines.push(["Zone ID", zone]);

    saveOrder({
      ok: true,
      slug: SERVICE_SLUG[tab],
      service,
      product: selected[0],
      price,
      admin: 0,
      lines,
      type: tab === "game" ? "game" : "prepaid",
    });
    router.push("/checkout/");
  };

  return (
    <div className="card p-5 md:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="kicker text-[#2A428C]">Transaksi cepat</div>
          <h2 className="text-xl md:text-2xl font-bold mt-1.5">Mau isi apa hari ini?</h2>
        </div>
        <span className="hidden sm:inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[#FFEF4D] px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#1D2650]">
          24/7
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-1.5 p-1 bg-[#F2F4FB] rounded-xl">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            aria-pressed={tab === t.key}
            onClick={() => selectTab(t.key)}
            className={`rounded-lg px-2 py-2 text-xs font-bold transition ${
              tab === t.key ? "bg-white text-[#1D2650] shadow-sm" : "text-[#5C6480] hover:text-[#1D2650]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "game" && (
        <div className="mt-5">
          <div className="text-xs font-bold uppercase tracking-wider text-[#5C6480]">Pilih game</div>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {gameNames.map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={name === game}
                onClick={() => setGame(name)}
                className={`rounded-lg border px-2.5 py-2.5 text-left text-xs font-bold transition ${
                  name === game
                    ? "border-[#2A428C] bg-[#FFEF4D] text-[#1D2650]"
                    : "border-[#E1E5F2] bg-white text-[#5C6480] hover:border-[#AEB9DF]"
                }`}
              >
                <div className="disp leading-tight">{name}</div>
                <div className="text-[10px] font-medium mt-1 opacity-70">Mulai {rp(GAMES[name].chips[0][2])}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <label className="block mt-5 text-xs font-bold uppercase tracking-wider text-[#5C6480]" htmlFor="buy-num">
        {P[tab].l}
      </label>
      <div className="mt-2 relative">
        <input
          id="buy-num"
          value={num}
          onChange={(e) => setNum(e.target.value)}
          inputMode="numeric"
          placeholder={P[tab].ph}
          className="inp text-base"
        />
        <span
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-[#FFEF4D] text-[#1D2650] px-2 py-1 rounded ${
            op ? "" : "hidden"
          }`}
        >
          {op}
        </span>
      </div>

      <input
        value={zone}
        onChange={(e) => setZone(e.target.value)}
        placeholder="Zone ID"
        aria-label="Zone ID"
        className={`${zoneVisible ? "" : "hidden"} inp mt-2.5`}
      />

      <div className="mt-5 text-xs font-bold uppercase tracking-wider text-[#5C6480]">Pilih nominal</div>
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
        {products.map(([label, value], i) => (
          <button
            key={label}
            type="button"
            aria-pressed={sel === i}
            onClick={() => setSel(i)}
            className={`rounded-lg border px-3 py-2.5 text-left transition ${
              sel === i
                ? "border-[#2A428C] bg-[#FFEF4D]"
                : "border-[#E1E5F2] bg-white hover:border-[#AEB9DF]"
            }`}
          >
            <div className="disp text-base font-bold">{label}</div>
            <div className="text-[11px] text-[#5C6480] mt-0.5">
              {tab === "tagihan" ? `admin ${rp(value)}` : rp(value)}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-xl bg-[#2A428C] p-3.5 pl-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-white/60 font-bold">Total bayar</div>
          <div className="disp text-xl font-bold text-white mt-0.5">{rp(price)}</div>
        </div>
        <button
          type="button"
          onClick={handlePay}
          disabled={!canPay}
          className="btn-lemon shrink-0 px-5 py-2.5 text-sm"
        >
          Bayar →
        </button>
      </div>
    </div>
  );
}
