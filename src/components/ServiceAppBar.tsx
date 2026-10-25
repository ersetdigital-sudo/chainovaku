"use client";

import { useRouter } from "next/navigation";
import { Icon } from "./Icons";
import type { Service } from "@/lib/services";

export function ServiceAppBar({ service }: { service: Service }) {
  const router = useRouter();

  return (
    <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-[#E1E5F2]">
      <div className="h-14 px-3 grid grid-cols-[40px_1fr_40px] items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Kembali"
          className="w-10 h-10 grid place-items-center rounded-lg hover:bg-[#F2F4FB] active:scale-95 transition"
        >
          <Icon name="chevronLeft" size={20} stroke="#1D2650" />
        </button>

        <span className="text-center text-sm font-bold truncate">{service.title}</span>

        <a
          href="https://wa.me/6285711172317"
          target="_blank"
          rel="noreferrer"
          aria-label="Hubungi admin WhatsApp"
          className="w-10 h-10 grid place-items-center rounded-lg bg-[#FFEF4D] text-[#1D2650] text-[10px] font-extrabold"
        >
          WA
        </a>
      </div>
    </div>
  );
}
