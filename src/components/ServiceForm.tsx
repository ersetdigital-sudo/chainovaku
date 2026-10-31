"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Game } from "@/lib/games";
import { hash, operator, rp } from "@/lib/format";
import { ADMIN_WHATSAPP, ADMIN_WHATSAPP_DISPLAY, saveOrder } from "@/lib/store";
import type { OrderLine } from "@/lib/store";
import type { Field, Service } from "@/lib/services";
import { Icon } from "./Icons";

type Bill = { name: string; amt: number; period: string; product: string; dbProductId: string };

export function ServiceForm({
  service,
  others,
  games,
}: {
  service: Service;
  others: Service[];
  games: Record<string, Game>;
}) {
  const router = useRouter();
  const gameNames = Object.keys(games);
  const wizardRef = useRef<HTMLDivElement>(null);

  const [game, setGame] = useState(gameNames[0]);
  const [vals, setVals] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of service.fields) if (f.sel) init[f.id] = f.sel[0];
    return init;
  });
  const [item, setItem] = useState<number | null>(null);
  const [bill, setBill] = useState<Bill | null>(null);
  const [billError, setBillError] = useState("");
  const [step, setStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const gameFields = useMemo<Field[]>(() => {
    const g = games[game];
    const list: Field[] = [{ id: "target", label: "User ID", ph: "Masukkan User ID", num: true }];
    if (g.zone) {
      list.push({
        id: "zone",
        label: g.label || "Zone ID",
        ph: g.label ? "Contoh: Asia" : "Contoh: 2241",
        num: !g.label,
      });
    }
    return list;
  }, [game, games]);

  const fields = service.type === "game" ? gameFields : service.fields;
  const items = service.type === "game" ? games[game].items : (service.items ?? []);
  const isBill = service.type === "bill";

  useEffect(() => {
    const mq = window.matchMedia("(max-width:1023px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    document.body.style.paddingBottom = isMobile ? "calc(92px + env(safe-area-inset-bottom))" : "";
    return () => {
      document.body.style.paddingBottom = "";
    };
  }, [isMobile]);

  const targetField = fields.find((f) => f.id === "target");
  const opTag = targetField?.op ? operator(vals.target ?? "") : "";

  const digits = (v: string) => v.replace(/\D/g, "");
  const target = digits(vals.target ?? "");
  const okT = target.length >= (service.type === "game" ? 5 : 8);
  const okZ = !(service.type === "game" && games[game].zone) || (vals.zone ?? "").trim().length > 0;

  const order = useMemo(() => {
    const lines: OrderLine[] = [["Layanan", service.type === "game" ? game : service.name]];

    const prov = fields.find((f) => f.sel);
    if (prov && vals.provider) lines.push([prov.label, vals.provider]);
    if (target && targetField) {
      lines.push([targetField.label, `${vals.target}${opTag ? ` · ${opTag}` : ""}`]);
    }
    if (vals.zone) lines.push([games[game].label || "Zone ID", vals.zone]);

    let price = 0;
    let product = "";
    let admin = 0;
    let dbProductId = "";

    if (service.type === "bill") {
      if (bill) {
        lines.push(["Nama", bill.name], ["Periode", bill.period]);
        price = bill.amt;
        admin = 0;
        product = bill.product;
        dbProductId = bill.dbProductId;
      }
    } else if (item !== null && items[item]) {
      const it = items[item];
      product = it[0];
      price = it[2];
      dbProductId = it[3] ?? "";
      lines.push(["Produk", it[1] ? `${it[0]} (${it[1]})` : it[0]]);
    }

    const ok = okT && okZ && (service.type === "bill" ? !!bill : item !== null);
    const composedTarget =
      service.type === "game" && vals.zone
        ? `${target} (${vals.zone})`
        : target;
    const input: Record<string, string> = {
      ...vals,
      ...(service.type === "game" ? { game } : {}),
      nomor_tujuan: composedTarget,
    };

    return {
      ok,
      slug: service.slug,
      service: service.name,
      product,
      price,
      admin,
      lines,
      type: service.type,
      dbServiceId: service.dbServiceId,
      dbProductId,
      target: composedTarget,
      input,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service, fields, items, game, vals, item, bill, target, targetField, opTag, okT, okZ]);

  const setField = (id: string, value: string) => {
    setVals((v) => ({ ...v, [id]: value }));
    if (isBill) {
      setBill(null);
      setBillError("");
    }
  };

  const changeGame = (name: string) => {
    setGame(name);
    setVals({});
    setItem(null);
  };

  const checkBill = () => {
    const id = digits(vals.target ?? "");
    if (id.length < 6) {
      setBill(null);
      setBillError("ID minimal 6 digit.");
      return false;
    }
    const months = parseInt(vals.provider) || 1;
    const productItem =
      service.slug === "bpjs-kesehatan"
        ? (service.items?.[months - 1] ?? service.items?.[0])
        : service.items?.[0];
    if (!productItem) {
      setBill(null);
      setBillError("Tagihan belum tersedia. Coba lagi sebentar.");
      return false;
    }
    const h = hash(id + service.slug);
    const name = `Pelanggan ${String.fromCharCode(65 + (h % 26))}*** ${String.fromCharCode(65 + ((h >> 3) % 26))}***`;
    const period = new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    setBill({
      name,
      amt: productItem[2],
      period,
      product: productItem[0],
      dbProductId: productItem[3] ?? "",
    });
    setBillError("");
    return true;
  };

  const goCheckout = () => {
    if (!order.ok) return;
    saveOrder(order);
    router.push("/checkout/");
  };

  const labels = isBill ? ["Data", "Tagihan", "Konfirmasi"] : ["Produk", "Tujuan", "Konfirmasi"];
  const total = order.price + order.admin;

  const canNext =
    step === 0
      ? isBill
        ? target.length >= 6
        : item !== null
      : step === 1
        ? isBill
          ? !!bill
          : okT && okZ
        : order.ok;

  const next = () => {
    if (!canNext) return;
    if (step === 0 && isBill) {
      if (!checkBill()) return;
      setStep(1);
      return;
    }
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    goCheckout();
  };

  const back = () => {
    if (step === 0) {
      router.back();
      return;
    }
    setStep(step - 1);
  };

  useEffect(() => {
    if (step > 0) {
      wizardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [step]);

  const nextLabel =
    step === 2
      ? "Lanjut ke pembayaran →"
      : step === 0 && isBill
        ? "Cek tagihan →"
        : step === 0
          ? "Lanjut isi data →"
          : "Lanjut konfirmasi →";

  const renderField = (f: Field) => {
    if (f.sel) {
      return (
        <label key={f.id} className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5C6480]">{f.label}</span>
          <select
            data-f={f.id}
            value={vals[f.id] ?? f.sel[0]}
            onChange={(e) => setField(f.id, e.target.value)}
            className="inp mt-2 min-h-12"
          >
            {f.sel.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
      );
    }
    return (
      <label key={f.id} className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-[#5C6480]">{f.label}</span>
        <span className="relative block mt-2">
          <input
            data-f={f.id}
            inputMode={f.num ? "numeric" : undefined}
            placeholder={f.ph ?? ""}
            value={vals[f.id] ?? ""}
            onChange={(e) => setField(f.id, e.target.value)}
            className="inp text-base min-h-12"
          />
          {f.op && (
            <span
              data-op
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-[#FFEF4D] text-[#1D2650] px-2 py-1 rounded ${
                opTag ? "" : "hidden"
              }`}
            >
              {opTag}
            </span>
          )}
        </span>
      </label>
    );
  };

  const summaryRows = (
    <>
      {order.lines.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4">
          <span className="text-[#5C6480] shrink-0">{k}</span>
          <b className="text-right break-words">{v}</b>
        </div>
      ))}
      {order.admin > 0 && (
        <div className="flex justify-between">
          <span className="text-[#5C6480]">Biaya admin</span>
          <b>{rp(order.admin)}</b>
        </div>
      )}
    </>
  );

  return (
    <div ref={wizardRef} className="scroll-mt-20">
      {/* mobile wizard header */}
      <div className="lg:hidden card p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="kicker text-[#2A428C]">Langkah {step + 1} dari 3</div>
            <div className="text-sm font-bold mt-1">{labels[step]}</div>
          </div>
          <span className="rounded bg-[#EEF1FB] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#2A428C]">
            {step === 0 ? "Mulai" : step === 1 ? "Hampir" : "Review"}
          </span>
        </div>
        <ol className="mt-3 grid grid-cols-3 gap-1.5">
          {labels.map((label, i) => (
            <li key={label}>
              <div
                className={`h-1 rounded-sm transition-colors ${
                  i <= step ? "bg-[#2A428C]" : "bg-[#DDE2F0]"
                }`}
              />
              <div
                className={`mt-1.5 text-[10px] font-bold uppercase tracking-wider ${
                  i <= step ? "text-[#2A428C]" : "text-[#9AA1BA]"
                }`}
              >
                {label}
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-3 lg:mt-0 lg:grid lg:grid-cols-[220px_1fr_300px] lg:gap-5 xl:gap-6 lg:items-start">
        {/* desktop rail */}
        <aside className="hidden lg:block lg:sticky lg:top-24">
          <ol className="relative">
            {labels.map((label, i) => {
              const active = step === i;
              const done = step > i;
              return (
                <li key={label} className="flex gap-3">
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
                      {done ? "✓" : i + 1}
                    </span>
                    {i < labels.length - 1 && (
                      <span className={`w-px min-h-[46px] ${done ? "bg-[#2A428C]" : "bg-[#DDE2F0]"}`} />
                    )}
                  </div>
                  <div className="pt-1">
                    <div className={`text-sm font-bold ${active ? "text-[#1D2650]" : "text-[#5C6480]"}`}>
                      {label}
                    </div>
                    <div className="text-[11px] text-[#9AA1BA] mt-0.5">
                      {i === 0
                        ? isBill
                          ? "ID pelanggan"
                          : "Game & nominal"
                        : i === 1
                          ? isBill
                            ? "Cek tagihan"
                            : "Nomor tujuan"
                          : "Cek ulang pesanan"}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-6 card p-4">
            <div className="kicker text-[#5C6480]">Butuh bantuan?</div>
            <p className="text-xs text-[#5C6480] mt-1.5">Admin siap bantu lewat WhatsApp.</p>
            <a
              href={ADMIN_WHATSAPP}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex rounded-md bg-[#FFEF4D] px-3 py-2 text-xs font-bold text-[#1D2650] border border-[#E8D83F]"
            >
              {ADMIN_WHATSAPP_DISPLAY}
            </a>
          </div>

          <div className="mt-3 card p-3">
            <div className="px-2 pt-1 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#5C6480]">
              Layanan lain
            </div>
            {others.slice(0, 4).map((other) => (
              <Link
                key={other.slug}
                href={`/layanan/${other.slug}/`}
                className="flex items-center gap-2.5 p-2 rounded-md hover:bg-[#F2F4FB]"
              >
                <span
                  className="w-7 h-7 rounded grid place-items-center"
                  style={{ background: other.icon.bg }}
                >
                  <Icon name={other.icon.name} size={13} stroke={other.icon.stroke} />
                </span>
                <span className="text-xs font-semibold">{other.title}</span>
              </Link>
            ))}
          </div>
        </aside>

        {/* active step */}
        <div>
          <section className="card p-5 md:p-6 min-h-[300px]">
            {step === 0 && !isBill && (
              <>
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded bg-[#2A428C] text-[#FFEF4D] grid place-items-center text-xs font-bold">
                    01
                  </span>
                  <h2 className="text-lg font-bold">
                    {service.type === "game" ? "Pilih game & item" : "Pilih nominal"}
                  </h2>
                </div>
                <p className="text-xs text-[#5C6480] mt-1.5">
                  {service.type === "game"
                    ? "Tentukan game, lalu pilih nominal itemnya."
                    : "Harga sudah termasuk biaya layanan Chainovaku."}
                </p>

                {service.type === "game" && (
                  <div className="mt-4">
                    <div className="flex items-end justify-between gap-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#5C6480]">
                        Pilih game
                      </span>
                      <span className="text-[10px] font-semibold text-[#9AA1BA]">
                        {gameNames.length} game mobile
                      </span>
                    </div>
                    <div className="mt-2.5 -mx-1 px-1 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:mx-0 lg:px-0 lg:grid lg:grid-cols-3 lg:overflow-visible">
                      {gameNames.map((name) => {
                        const selectedGame = name === game;
                        return (
                          <button
                            key={name}
                            type="button"
                            data-game-card
                            aria-pressed={selectedGame}
                            onClick={() => changeGame(name)}
                            className={`relative w-[148px] shrink-0 rounded-xl border p-3 text-left min-h-[132px] transition lg:w-auto ${
                              selectedGame
                                ? "border-[#E8D83F] bg-[#FFEF4D] text-[#1D2650]"
                                : "border-[#1D2650] bg-[#1D2650] text-white hover:border-[#FFEF4D]"
                            }`}
                          >
                            <span
                              className={`w-8 h-8 rounded-md grid place-items-center text-[10px] font-extrabold ${
                                selectedGame
                                  ? "bg-[#1D2650] text-[#FFEF4D]"
                                  : "bg-[#FFEF4D] text-[#1D2650]"
                              }`}
                            >
                              {games[name].mark}
                            </span>
                            <span className="mt-2 block text-sm font-bold leading-tight">{name}</span>
                            <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-[.14em] opacity-60">
                              {games[name].tag}
                            </span>
                            <span className="mt-2 block text-[10px] font-semibold opacity-70">
                              Mulai {rp(games[name].items[0][2])}
                            </span>
                            {selectedGame && (
                              <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-[4px] bg-[#1D2650] grid place-items-center">
                                <Icon name="check" size={9} stroke="#FFEF4D" strokeWidth={3.4} />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {service.type === "game" && (
                  <div className="mt-5 pt-4 border-t border-dashed border-[#C9D0E6] flex items-end justify-between gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#5C6480]">
                      Pilih item
                    </span>
                    <span className="text-[10px] font-semibold text-[#9AA1BA]">{game}</span>
                  </div>
                )}

                <div
                  className={`${
                    service.type === "game" ? "mt-2" : "mt-4"
                  } grid grid-cols-2 sm:grid-cols-3 gap-2`}
                >
                  {items.map((it, i) => (
                    <button
                      key={it[0]}
                      type="button"
                      data-item-card
                      onClick={() => setItem(i)}
                      className={`relative rounded-lg border px-3 py-3 text-left min-h-[72px] transition ${
                        item === i
                          ? "border-[#2A428C] bg-[#FFEF4D]"
                          : "border-[#E1E5F2] bg-white hover:border-[#AEB9DF]"
                      }`}
                    >
                      {item === i && (
                        <span className="absolute top-2 right-2 w-4 h-4 rounded-sm bg-[#2A428C] grid place-items-center">
                          <Icon name="check" size={9} stroke="#FFEF4D" strokeWidth={3.4} />
                        </span>
                      )}
                      <div className="disp font-bold text-sm pr-5">{it[0]}</div>
                      {it[1] ? <div className="text-[10px] text-[#5C6480] mt-0.5">{it[1]}</div> : null}
                      <div className="text-xs font-bold text-[#2A428C] mt-2">{rp(it[2])}</div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 0 && isBill && (
              <>
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded bg-[#2A428C] text-[#FFEF4D] grid place-items-center text-xs font-bold">
                    01
                  </span>
                  <h2 className="text-lg font-bold">Masukkan data tagihan</h2>
                </div>
                <p className="text-xs text-[#5C6480] mt-1.5">
                  Pilih penyedia lalu masukkan ID pelanggan untuk mengecek tagihan.
                </p>
                <div className="mt-4 space-y-3">{service.fields.map(renderField)}</div>
                {billError && <p className="text-sm text-[#C81E3C] mt-3">{billError}</p>}
                <div className="mt-4 rounded-lg bg-[#F7F8FD] border border-[#E1E5F2] p-3 text-xs text-[#5C6480]">
                  Biaya admin {rp(service.admin ?? 0)} ditambahkan setelah tagihan ditemukan.
                </div>
              </>
            )}

            {step === 1 && !isBill && (
              <>
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded bg-[#2A428C] text-[#FFEF4D] grid place-items-center text-xs font-bold">
                    02
                  </span>
                  <h2 className="text-lg font-bold">Data tujuan</h2>
                </div>
                <p className="text-xs text-[#5C6480] mt-1.5">
                  {service.type === "game"
                    ? "Masukkan User ID akun game kamu."
                    : "Operator terdeteksi otomatis untuk pulsa dan paket data."}
                </p>

                {item !== null && (
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-[#FFEF4D] border border-[#E8D83F] px-3.5 py-2.5">
                    <span className="text-xs font-bold text-[#1D2650]">
                      {service.type === "game" ? `${game} · ` : ""}
                      {items[item]?.[0]}
                    </span>
                    <span className="text-xs font-bold text-[#1D2650]">{rp(items[item]?.[2] ?? 0)}</span>
                  </div>
                )}

                <div className="mt-4 grid sm:grid-cols-2 gap-3">{fields.map(renderField)}</div>

                <div className="mt-4 flex items-start gap-2 rounded-lg bg-[#F7F8FD] border border-[#E1E5F2] p-3">
                  <Icon name="shieldCheck" size={15} stroke="#2A428C" className="mt-0.5 shrink-0" />
                  <p className="text-[11px] text-[#5C6480] leading-relaxed">
                    Pastikan data tujuan benar. Transaksi yang sudah diproses tidak bisa dibatalkan.
                  </p>
                </div>
              </>
            )}

            {step === 1 && isBill && bill && (
              <>
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded bg-[#2A428C] text-[#FFEF4D] grid place-items-center text-xs font-bold">
                    02
                  </span>
                  <h2 className="text-lg font-bold">Tagihan ditemukan</h2>
                </div>
                <div className="mt-4 rounded-lg border border-[#E1E5F2] overflow-hidden">
                  <div className="bg-[#EEF1FB] px-4 py-3 flex justify-between items-center">
                    <span className="text-xs font-bold text-[#2A428C]">Tagihan {service.name}</span>
                    <span className="rounded bg-[#FFEF4D] px-2 py-0.5 text-[10px] font-bold text-[#1D2650]">
                      {bill.period}
                    </span>
                  </div>
                  <div className="p-4 space-y-2.5 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-[#5C6480]">Nama</span>
                      <b className="text-right">{bill.name}</b>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-[#5C6480]">ID pelanggan</span>
                      <b className="text-right font-mono">{vals.target}</b>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-[#5C6480]">Tagihan</span>
                      <b>{rp(bill.amt)}</b>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-[#5C6480]">Biaya admin</span>
                      <b>{rp(service.admin ?? 0)}</b>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setBill(null);
                    setStep(0);
                  }}
                  className="mt-3 text-xs font-bold text-[#2A428C] hover:underline"
                >
                  ← Ubah data tagihan
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded bg-[#2A428C] text-[#FFEF4D] grid place-items-center text-xs font-bold">
                    03
                  </span>
                  <h2 className="text-lg font-bold">Konfirmasi pesanan</h2>
                </div>
                <p className="text-xs text-[#5C6480] mt-1.5">
                  Cek ulang data sebelum melanjutkan ke pembayaran QRIS.
                </p>

                <div className="mt-4 rounded-lg border border-[#E1E5F2]">
                  <div className="px-4 py-3 border-b border-[#E1E5F2] flex items-center gap-2.5">
                    <span
                      className="w-8 h-8 rounded-md grid place-items-center"
                      style={{ background: service.icon.bg }}
                    >
                      <Icon name={service.icon.name} size={15} stroke={service.icon.stroke} />
                    </span>
                    <span className="text-sm font-bold">
                      {service.type === "game" ? game : service.name}
                    </span>
                  </div>
                  <div className="p-4 space-y-2.5 text-sm">{summaryRows}</div>
                  <div className="px-4 py-3 border-t border-dashed border-[#C9D0E6] flex justify-between items-baseline bg-[#F7F8FD]">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#5C6480]">Total</span>
                    <span className="disp text-lg font-bold">{rp(total)}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-start gap-2 rounded-lg bg-[#FFEF4D] border border-[#E8D83F] p-3">
                  <Icon name="shieldCheck" size={15} stroke="#1D2650" className="mt-0.5 shrink-0" />
                  <p className="text-[11px] text-[#3B456B] leading-relaxed">
                    Pembayaran diverifikasi manual oleh admin. Simpan nomor invoice setelah checkout.
                  </p>
                </div>
              </>
            )}

            {/* desktop controls */}
            <div className="hidden lg:flex items-center justify-between gap-3 mt-6 pt-4 border-t border-[#E1E5F2]">
              <button
                type="button"
                onClick={back}
                className="text-sm font-bold text-[#5C6480] hover:text-[#1D2650]"
              >
                ← {step === 0 ? "Kembali" : "Sebelumnya"}
              </button>
              <button
                type="button"
                onClick={next}
                disabled={!canNext}
                className="btn-lemon px-5 py-2.5 text-sm"
              >
                {nextLabel}
              </button>
            </div>
          </section>

          {/* mobile info */}
          <div className="lg:hidden mt-3 space-y-2.5">
            <details className="card px-4 py-3.5">
              <summary className="flex items-center justify-between font-bold cursor-pointer text-sm">
                Cara bayar
                <Icon name="chevronDown" size={16} stroke="#5C6480" className="chev transition-transform" />
              </summary>
              <ol className="mt-3 space-y-2.5 text-sm">
                {service.how.map((text, i) => (
                  <li key={text} className="flex gap-3">
                    <span className="w-5 h-5 shrink-0 rounded bg-[#2A428C] text-[#FFEF4D] grid place-items-center text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <span className="text-[#3B456B]">{text}</span>
                  </li>
                ))}
              </ol>
            </details>

            <details className="card px-4 py-3.5">
              <summary className="flex items-center justify-between font-bold cursor-pointer text-sm">
                Pertanyaan umum
                <Icon name="chevronDown" size={16} stroke="#5C6480" className="chev transition-transform" />
              </summary>
              <div className="mt-1">
                {service.faq.map(([q, a]) => (
                  <details key={q} className="border-t border-[#E1E5F2] py-3">
                    <summary className="flex justify-between gap-2 cursor-pointer text-sm font-semibold">
                      {q}
                      <span className="pl transition text-base leading-none text-[#5C6480]">+</span>
                    </summary>
                    <p className="text-[#5C6480] mt-2 text-sm">{a}</p>
                  </details>
                ))}
              </div>
            </details>
          </div>

          <div className="lg:hidden mt-3">
            <div className="kicker text-[#5C6480] px-1 mb-2">Layanan lain</div>
            <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-4 px-4 [scrollbar-width:none]">
              {others.map((other) => (
                <Link
                  key={other.slug}
                  href={`/layanan/${other.slug}/`}
                  className="shrink-0 w-[138px] rounded-xl bg-white border border-[#E1E5F2] p-3 hover:border-[#2A428C]"
                >
                  <span
                    className="w-9 h-9 rounded-md grid place-items-center"
                    style={{ background: other.icon.bg }}
                  >
                    <Icon name={other.icon.name} size={16} stroke={other.icon.stroke} />
                  </span>
                  <div className="mt-2 text-xs font-bold leading-tight">{other.title}</div>
                  <div className="text-[10px] text-[#5C6480] mt-0.5 line-clamp-2">{other.blurb}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* desktop summary */}
        <aside className="hidden lg:block lg:sticky lg:top-24 card p-5">
          <div className="kicker text-[#2A428C]">Ringkasan</div>
          <div className="mt-3 flex items-center gap-2.5 pb-3 border-b border-[#E1E5F2]">
            <span
              className="w-9 h-9 rounded-md grid place-items-center"
              style={{ background: service.icon.bg }}
            >
              <Icon name={service.icon.name} size={16} stroke={service.icon.stroke} />
            </span>
            <div>
              <div className="text-sm font-bold">{service.type === "game" ? game : service.name}</div>
              <div className="text-[11px] text-[#5C6480]">{labels[step]}</div>
            </div>
          </div>
          <div className="mt-3 space-y-2.5 text-sm">{summaryRows}</div>
          <div className="mt-4 pt-4 border-t border-dashed border-[#C9D0E6] flex justify-between items-baseline">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5C6480]">Total</span>
            <span className="disp text-xl font-bold">{rp(total)}</span>
          </div>
          <p className="text-[11px] text-[#5C6480] mt-3">
            {order.ok ? "Data lengkap. Lanjutkan untuk konfirmasi." : "Lengkapi tahap saat ini dulu."}
          </p>
        </aside>
      </div>

      {/* mobile action bar */}
      {isMobile && (
        <div className="fixed inset-x-0 bottom-0 z-40 bg-white border-t border-[#E1E5F2] px-3 pt-2.5 pb-[calc(.6rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={back}
              className="shrink-0 rounded-lg border border-[#E1E5F2] bg-white px-3.5 py-3 text-xs font-bold text-[#5C6480] active:scale-95 transition"
            >
              {step === 0 ? "Kembali" : "Sebelumnya"}
            </button>
            <button
              type="button"
              onClick={next}
              disabled={!canNext}
              className="btn-lemon flex-1 min-h-[46px] text-sm"
            >
              {nextLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
