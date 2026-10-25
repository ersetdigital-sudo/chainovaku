"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "./Icons";
import type { Service } from "@/lib/services";

function useCountUp(target: number, decimals = 0, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value.toLocaleString("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function ServiceCard({ service, clone = false }: { service: Service; clone?: boolean }) {
  return (
    <Link
      href={`/layanan/${service.slug}/`}
      tabIndex={clone ? -1 : undefined}
      aria-hidden={clone || undefined}
      className="group flex w-[220px] md:w-[250px] shrink-0 items-center gap-3 rounded-xl border border-[#D9DEF0] bg-white px-3.5 py-3 transition hover:border-[#2A428C]"
    >
      <span
        className="w-9 h-9 shrink-0 rounded-lg grid place-items-center"
        style={{ background: service.icon.bg }}
      >
        <Icon name={service.icon.name} size={16} stroke={service.icon.stroke} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold leading-tight truncate">{service.title}</span>
        <span className="block text-[11px] text-[#5C6480] truncate">{service.blurb}</span>
      </span>
      <span className="w-6 h-6 shrink-0 rounded-md border border-[#E1E5F2] grid place-items-center text-[10px] text-[#5C6480] transition group-hover:bg-[#FFEF4D] group-hover:border-[#E8D83F] group-hover:text-[#1D2650]">
        →
      </span>
    </Link>
  );
}

export function HeroKinetic({ services }: { services: Service[] }) {
  const transactions = useCountUp(1.2, 1);
  const servicesCount = useCountUp(services.length);
  const speed = useCountUp(3);

  return (
    <section className="relative overflow-hidden bg-[#EEF1FB] border-b border-[#D9DEF0]">
      <div className="max-w-5xl mx-auto px-5 pt-12 md:pt-16 text-center">
        <div className="hero-enter hero-d1 inline-flex items-center gap-2 rounded-full border border-[#C9D0E6] bg-white px-3.5 py-1.5 text-[11px] font-bold tracking-wide text-[#2A428C]">
          <span className="hero-pulse w-1.5 h-1.5 rounded-full bg-[#2A428C]" />
          CHAINOVAKU · PPOB PLATFORM
        </div>

        <h1 className="hero-enter hero-d2 mt-5 text-[42px] sm:text-[56px] md:text-[72px] font-bold leading-[.98]">
          Satu chain untuk
          <br />
          <span className="relative inline-block">
            <span className="hero-mark absolute inset-x-0 bottom-1 h-[55%] bg-[#FFEF4D]" aria-hidden />
            <span className="relative">semua transaksi.</span>
          </span>
        </h1>

        <p className="hero-enter hero-d3 mt-5 mx-auto max-w-xl text-[#4A5375] text-base md:text-lg leading-relaxed">
          Pulsa, data, token listrik, game, e-wallet, sampai tagihan. Tanpa daftar, tanpa antre,
          diproses otomatis 24 jam.
        </p>

        <div className="hero-enter hero-d4 mt-7 flex flex-wrap justify-center gap-2.5">
          <a href="#beli" className="btn px-5 py-3 text-sm">
            Mulai transaksi →
          </a>
          <a
            href="#layanan"
            className="rounded-lg border border-[#B9C2DD] bg-white px-5 py-3 text-sm font-bold hover:border-[#2A428C] transition"
          >
            Lihat 9 layanan
          </a>
        </div>

        <div className="hero-enter hero-d5 mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] font-semibold text-[#4A5375]">
          <span className="flex items-center gap-1.5">
            <Icon name="shieldCheck" size={13} stroke="#2A428C" /> Refund otomatis
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="zap" size={13} stroke="#2A428C" /> Proses instan
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="check" size={13} stroke="#2A428C" /> Bukti transaksi
          </span>
        </div>
      </div>

      <div className="hero-enter hero-d6 mt-10">
        <div className="flex items-center justify-center gap-3 mb-3 px-5">
          <span className="h-px w-8 bg-[#C9D0E6]" />
          <span className="text-xs font-bold text-[#5C6480]">Pilih layananmu, langsung beres.</span>
          <span className="h-px w-8 bg-[#C9D0E6]" />
        </div>
        <div
          className="hero-rail relative overflow-hidden border-y border-[#D9DEF0] bg-white/55 py-3"
          data-hero-rail
        >
          <div
            className="hero-track flex w-max gap-2.5 px-2.5"
            data-hero-track
          >
            {services.map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
            {services.map((service) => (
              <ServiceCard key={`clone-${service.slug}`} service={service} clone />
            ))}
          </div>
        </div>
      </div>

      <div className="hero-enter hero-d7 max-w-5xl mx-auto px-5 pb-9 md:pb-11 mt-8">
        <dl className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[#D9DEF0] rounded-xl border border-[#D9DEF0] bg-white overflow-hidden">
          <div className="p-4 md:p-5">
            <dd className="disp text-2xl md:text-3xl font-bold">{transactions}jt+</dd>
            <dt className="text-[11px] font-semibold text-[#5C6480] mt-0.5">order tuntas</dt>
          </div>
          <div className="p-4 md:p-5">
            <dd className="disp text-2xl md:text-3xl font-bold">{servicesCount}</dd>
            <dt className="text-[11px] font-semibold text-[#5C6480] mt-0.5">layanan tersambung</dt>
          </div>
          <div className="p-4 md:p-5">
            <dd className="disp text-2xl md:text-3xl font-bold">{speed} dtk</dd>
            <dt className="text-[11px] font-semibold text-[#5C6480] mt-0.5">rata-rata eksekusi</dt>
          </div>
          <div className="p-4 md:p-5 bg-[#FFEF4D]">
            <dd className="disp text-2xl md:text-3xl font-bold">24/7</dd>
            <dt className="text-[11px] font-semibold text-[#3B456B] mt-0.5">operasional tanpa jeda</dt>
          </div>
        </dl>
      </div>
    </section>
  );
}
